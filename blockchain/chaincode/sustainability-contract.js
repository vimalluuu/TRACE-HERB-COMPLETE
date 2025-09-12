'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * Sustainability Smart Contract for TRACE HERB
 * Enforces sustainability criteria, conservation rules, and fair trade practices
 */
class SustainabilityContract extends Contract {

  constructor() {
    super('SustainabilityContract');
  }

  /**
   * Initialize sustainability rules and conservation data
   */
  async initSustainabilityRules(ctx) {
    console.info('============= START : Initialize Sustainability Rules ===========');
    
    // Conservation status database
    const conservationStatus = {
      'Withania somnifera': {
        status: 'least-concern',
        population: 'stable',
        harvestQuota: 1000, // kg per season per zone
        minRegenerationPeriod: 2 // years
      },
      'Nardostachys jatamansi': {
        status: 'critically-endangered',
        population: 'declining',
        harvestQuota: 50, // kg per season per zone
        minRegenerationPeriod: 5, // years
        permitRequired: true,
        citesAppendix: 'II'
      },
      'Picrorhiza kurroa': {
        status: 'endangered',
        population: 'declining',
        harvestQuota: 100, // kg per season per zone
        minRegenerationPeriod: 4, // years
        permitRequired: true
      },
      'Bacopa monnieri': {
        status: 'least-concern',
        population: 'stable',
        harvestQuota: 500, // kg per season per zone
        minRegenerationPeriod: 1 // years
      }
    };
    
    for (const [species, data] of Object.entries(conservationStatus)) {
      await ctx.stub.putState(`CONSERVATION_${species}`, Buffer.from(JSON.stringify(data)));
    }
    
    // Fair trade minimum prices (INR per kg)
    const fairTradePrices = {
      'Withania somnifera': { farmGate: 150, fairTrade: 200, premium: 50 },
      'Nardostachys jatamansi': { farmGate: 2000, fairTrade: 2500, premium: 500 },
      'Picrorhiza kurroa': { farmGate: 1500, fairTrade: 2000, premium: 500 },
      'Bacopa monnieri': { farmGate: 100, fairTrade: 150, premium: 50 }
    };
    
    for (const [species, prices] of Object.entries(fairTradePrices)) {
      await ctx.stub.putState(`FAIRTRADE_${species}`, Buffer.from(JSON.stringify(prices)));
    }
    
    // Sustainable harvesting practices
    const harvestingPractices = {
      'root-collection': {
        maxHarvestPercentage: 30, // Maximum 30% of available roots
        regenerationRequired: true,
        seasonalRestrictions: true,
        toolsAllowed: ['hand-tools', 'small-spades'],
        toolsProhibited: ['mechanical-diggers', 'heavy-machinery']
      },
      'leaf-collection': {
        maxHarvestPercentage: 50, // Maximum 50% of leaves
        regenerationRequired: false,
        seasonalRestrictions: false,
        toolsAllowed: ['hand-picking', 'pruning-shears'],
        toolsProhibited: ['mechanical-harvesters']
      },
      'bark-collection': {
        maxHarvestPercentage: 10, // Maximum 10% of bark
        regenerationRequired: true,
        seasonalRestrictions: true,
        toolsAllowed: ['hand-tools', 'knives'],
        toolsProhibited: ['power-tools']
      }
    };
    
    for (const [practice, rules] of Object.entries(harvestingPractices)) {
      await ctx.stub.putState(`PRACTICE_${practice}`, Buffer.from(JSON.stringify(rules)));
    }
    
    console.info('============= END : Initialize Sustainability Rules ===========');
  }

  /**
   * Validate sustainability compliance for collection event
   */
  async validateSustainabilityCompliance(ctx, collectionEventString) {
    const collectionEvent = JSON.parse(collectionEventString);
    const species = collectionEvent.subject.botanicalName;
    const errors = [];
    const warnings = [];
    
    // Check conservation status
    const conservationData = await this.getConservationStatus(ctx, species);
    if (conservationData) {
      // Check if permit is required
      if (conservationData.permitRequired && !collectionEvent.sustainability?.conservation?.permit) {
        errors.push(`Collection permit required for ${species} (${conservationData.status})`);
      }
      
      // Check harvest quota
      const currentSeasonHarvest = await this.getCurrentSeasonHarvest(ctx, species, collectionEvent.location.geoFence?.zone);
      const proposedTotal = currentSeasonHarvest + collectionEvent.quantity.value;
      
      if (proposedTotal > conservationData.harvestQuota) {
        errors.push(`Harvest quota exceeded for ${species}. Current: ${currentSeasonHarvest}kg, Proposed: ${collectionEvent.quantity.value}kg, Quota: ${conservationData.harvestQuota}kg`);
      }
      
      // Check if approaching quota limit
      if (proposedTotal > conservationData.harvestQuota * 0.8) {
        warnings.push(`Approaching harvest quota limit for ${species} (${Math.round((proposedTotal/conservationData.harvestQuota)*100)}% of quota)`);
      }
    }
    
    // Validate harvesting practices
    const practiceValidation = await this.validateHarvestingPractices(ctx, collectionEvent);
    errors.push(...practiceValidation.errors);
    warnings.push(...practiceValidation.warnings);
    
    // Validate fair trade compliance
    const fairTradeValidation = await this.validateFairTrade(ctx, collectionEvent);
    errors.push(...fairTradeValidation.errors);
    warnings.push(...fairTradeValidation.warnings);
    
    return {
      isCompliant: errors.length === 0,
      errors,
      warnings,
      conservationStatus: conservationData?.status || 'unknown',
      quotaUtilization: conservationData ? Math.round(((currentSeasonHarvest + collectionEvent.quantity.value) / conservationData.harvestQuota) * 100) : 0
    };
  }

  /**
   * Validate harvesting practices
   */
  async validateHarvestingPractices(ctx, collectionEvent) {
    const errors = [];
    const warnings = [];
    const partUsed = collectionEvent.subject.partUsed[0]; // Assuming single part for simplicity
    
    // Map plant parts to collection practices
    const partToPractice = {
      'roots': 'root-collection',
      'leaves': 'leaf-collection',
      'bark': 'bark-collection',
      'whole-plant': 'root-collection' // Most restrictive
    };
    
    const practiceType = partToPractice[partUsed] || 'root-collection';
    const practiceRules = await this.getHarvestingPractice(ctx, practiceType);
    
    if (practiceRules) {
      // Check if sustainable method is used
      const harvestingMethod = collectionEvent.sustainability?.harvestingPractices?.method;
      if (practiceRules.toolsProhibited.includes(harvestingMethod)) {
        errors.push(`Prohibited harvesting method: ${harvestingMethod} for ${partUsed} collection`);
      }
      
      // Check regeneration practices
      if (practiceRules.regenerationRequired && !collectionEvent.sustainability?.harvestingPractices?.regeneration) {
        errors.push(`Regeneration practices required for ${partUsed} collection`);
      }
      
      // Estimate harvest percentage (simplified calculation)
      const estimatedAvailable = collectionEvent.quantity.estimatedYield || collectionEvent.quantity.value * 2;
      const harvestPercentage = (collectionEvent.quantity.value / estimatedAvailable) * 100;
      
      if (harvestPercentage > practiceRules.maxHarvestPercentage) {
        errors.push(`Harvest percentage (${Math.round(harvestPercentage)}%) exceeds sustainable limit (${practiceRules.maxHarvestPercentage}%) for ${partUsed}`);
      }
      
      if (harvestPercentage > practiceRules.maxHarvestPercentage * 0.8) {
        warnings.push(`High harvest percentage (${Math.round(harvestPercentage)}%) approaching sustainable limit for ${partUsed}`);
      }
    }
    
    return { errors, warnings };
  }

  /**
   * Validate fair trade compliance
   */
  async validateFairTrade(ctx, collectionEvent) {
    const errors = [];
    const warnings = [];
    const species = collectionEvent.subject.botanicalName;
    
    if (collectionEvent.sustainability?.fairTrade?.certified) {
      const fairTradePrices = await this.getFairTradePrices(ctx, species);
      
      if (fairTradePrices) {
        const paidPrice = collectionEvent.sustainability.fairTrade.price;
        const minimumPrice = fairTradePrices.fairTrade;
        
        if (paidPrice < minimumPrice) {
          errors.push(`Fair trade price (₹${paidPrice}/kg) below minimum (₹${minimumPrice}/kg) for ${species}`);
        }
        
        // Check if premium is paid
        const premium = collectionEvent.sustainability.fairTrade.premium || 0;
        const expectedPremium = fairTradePrices.premium;
        
        if (premium < expectedPremium) {
          warnings.push(`Fair trade premium (₹${premium}/kg) below recommended (₹${expectedPremium}/kg) for ${species}`);
        }
      }
    }
    
    return { errors, warnings };
  }

  /**
   * Record harvest quota usage
   */
  async recordHarvestQuota(ctx, species, zone, quantity, collectionDate) {
    const year = new Date(collectionDate).getFullYear();
    const quotaKey = `QUOTA_${species}_${zone}_${year}`;
    
    const existingQuotaBytes = await ctx.stub.getState(quotaKey);
    let currentUsage = 0;
    
    if (existingQuotaBytes && existingQuotaBytes.length > 0) {
      const quotaData = JSON.parse(existingQuotaBytes.toString());
      currentUsage = quotaData.used;
    }
    
    const newUsage = currentUsage + quantity;
    const quotaData = {
      species,
      zone,
      year,
      used: newUsage,
      lastUpdated: new Date().toISOString()
    };
    
    await ctx.stub.putState(quotaKey, Buffer.from(JSON.stringify(quotaData)));
    return newUsage;
  }

  /**
   * Get current season harvest for species in zone
   */
  async getCurrentSeasonHarvest(ctx, species, zone) {
    const year = new Date().getFullYear();
    const quotaKey = `QUOTA_${species}_${zone}_${year}`;
    
    const quotaBytes = await ctx.stub.getState(quotaKey);
    if (!quotaBytes || quotaBytes.length === 0) {
      return 0;
    }
    
    const quotaData = JSON.parse(quotaBytes.toString());
    return quotaData.used || 0;
  }

  /**
   * Get conservation status for species
   */
  async getConservationStatus(ctx, species) {
    const conservationBytes = await ctx.stub.getState(`CONSERVATION_${species}`);
    if (!conservationBytes || conservationBytes.length === 0) {
      return null;
    }
    
    return JSON.parse(conservationBytes.toString());
  }

  /**
   * Get harvesting practice rules
   */
  async getHarvestingPractice(ctx, practiceType) {
    const practiceBytes = await ctx.stub.getState(`PRACTICE_${practiceType}`);
    if (!practiceBytes || practiceBytes.length === 0) {
      return null;
    }
    
    return JSON.parse(practiceBytes.toString());
  }

  /**
   * Get fair trade prices for species
   */
  async getFairTradePrices(ctx, species) {
    const priceBytes = await ctx.stub.getState(`FAIRTRADE_${species}`);
    if (!priceBytes || priceBytes.length === 0) {
      return null;
    }
    
    return JSON.parse(priceBytes.toString());
  }

  /**
   * Generate sustainability report for a collection event
   */
  async generateSustainabilityReport(ctx, collectionEventId) {
    const collectionEventBytes = await ctx.stub.getState(collectionEventId);
    if (!collectionEventBytes || collectionEventBytes.length === 0) {
      throw new Error(`Collection event ${collectionEventId} not found`);
    }
    
    const collectionEvent = JSON.parse(collectionEventBytes.toString());
    const compliance = await this.validateSustainabilityCompliance(ctx, JSON.stringify(collectionEvent));
    
    const report = {
      collectionEventId,
      species: collectionEvent.subject.botanicalName,
      collectionDate: collectionEvent.performedDateTime,
      location: collectionEvent.location.address,
      quantity: collectionEvent.quantity,
      sustainability: {
        compliance: compliance.isCompliant,
        conservationStatus: compliance.conservationStatus,
        quotaUtilization: compliance.quotaUtilization,
        errors: compliance.errors,
        warnings: compliance.warnings
      },
      recommendations: this.generateRecommendations(compliance),
      generatedAt: new Date().toISOString()
    };
    
    return report;
  }

  /**
   * Generate sustainability recommendations
   */
  generateRecommendations(compliance) {
    const recommendations = [];
    
    if (compliance.quotaUtilization > 80) {
      recommendations.push('Consider diversifying collection areas to reduce pressure on this zone');
      recommendations.push('Implement enhanced regeneration practices');
    }
    
    if (compliance.conservationStatus === 'endangered' || compliance.conservationStatus === 'critically-endangered') {
      recommendations.push('Prioritize cultivation over wild collection');
      recommendations.push('Implement community-based conservation programs');
    }
    
    if (compliance.warnings.some(w => w.includes('fair trade'))) {
      recommendations.push('Review fair trade pricing to ensure adequate farmer compensation');
    }
    
    if (compliance.warnings.some(w => w.includes('harvest percentage'))) {
      recommendations.push('Reduce harvest intensity to ensure long-term sustainability');
      recommendations.push('Allow longer regeneration periods between harvests');
    }
    
    return recommendations;
  }
}

module.exports = SustainabilityContract;
