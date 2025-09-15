const crypto = require('crypto');

class SustainabilityService {
  constructor() {
    // Mock blockchain state for sustainability tracking
    this.greenTokens = new Map(); // farmerId -> token balance
    this.reputationScores = new Map(); // farmerId -> reputation data
    this.sustainabilityMetrics = new Map(); // farmerId -> metrics
    this.incentivePrograms = new Map(); // programId -> program details
    this.carbonCredits = new Map(); // farmerId -> carbon credit data
    this.complianceRecords = new Map(); // farmerId -> compliance history
    
    // Initialize mock data
    this.initializeMockData();
    
    // Sustainability scoring weights
    this.scoringWeights = {
      organicCertification: 25,
      waterConservation: 20,
      soilHealth: 20,
      biodiversity: 15,
      carbonSequestration: 10,
      wasteReduction: 10
    };

    // Green token reward rates (tokens per action)
    this.tokenRewards = {
      organicHarvest: 50,
      waterSaving: 25,
      soilImprovement: 30,
      biodiversityAction: 20,
      carbonOffset: 40,
      wasteReduction: 15,
      qualityCompliance: 35,
      timelyReporting: 10
    };
  }

  initializeMockData() {
    // Initialize farmers with sustainability data
    const farmers = [
      { id: 'FARM-001', name: 'Rajesh Kumar', location: 'Karnataka' },
      { id: 'FARM-002', name: 'Priya Sharma', location: 'Tamil Nadu' },
      { id: 'FARM-003', name: 'Amit Patel', location: 'Gujarat' }
    ];

    farmers.forEach(farmer => {
      // Initialize green tokens
      this.greenTokens.set(farmer.id, {
        balance: Math.floor(Math.random() * 1000) + 500,
        earned: Math.floor(Math.random() * 2000) + 1000,
        spent: Math.floor(Math.random() * 500) + 200,
        lastUpdated: new Date().toISOString()
      });

      // Initialize reputation scores
      this.reputationScores.set(farmer.id, {
        overall: Math.floor(Math.random() * 30) + 70, // 70-100
        sustainability: Math.floor(Math.random() * 25) + 75,
        quality: Math.floor(Math.random() * 20) + 80,
        compliance: Math.floor(Math.random() * 15) + 85,
        innovation: Math.floor(Math.random() * 40) + 60,
        community: Math.floor(Math.random() * 35) + 65,
        history: this.generateReputationHistory(),
        badges: this.generateBadges(),
        level: this.calculateLevel(Math.floor(Math.random() * 30) + 70)
      });

      // Initialize sustainability metrics
      this.sustainabilityMetrics.set(farmer.id, {
        organicCertified: Math.random() > 0.3,
        waterUsageReduction: Math.floor(Math.random() * 40) + 10, // 10-50%
        soilHealthScore: Math.floor(Math.random() * 30) + 70, // 70-100
        biodiversityIndex: Math.floor(Math.random() * 25) + 75,
        carbonSequestration: Math.floor(Math.random() * 500) + 200, // kg CO2/year
        wasteReduction: Math.floor(Math.random() * 60) + 20, // 20-80%
        renewableEnergyUse: Math.floor(Math.random() * 80) + 20, // 20-100%
        lastAssessment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Initialize carbon credits
      this.carbonCredits.set(farmer.id, {
        totalCredits: Math.floor(Math.random() * 100) + 50,
        availableCredits: Math.floor(Math.random() * 50) + 25,
        soldCredits: Math.floor(Math.random() * 30) + 10,
        pricePerCredit: Math.floor(Math.random() * 20) + 15, // $15-35
        lastCalculation: new Date().toISOString(),
        projectedAnnual: Math.floor(Math.random() * 200) + 100
      });
    });

    // Initialize incentive programs
    this.incentivePrograms.set('PROG-001', {
      id: 'PROG-001',
      name: 'Organic Transition Support',
      description: 'Support farmers transitioning to organic practices',
      tokenReward: 500,
      requirements: ['organic_certification_progress', 'soil_health_improvement'],
      duration: '12 months',
      participants: 15,
      maxParticipants: 50,
      status: 'active'
    });

    this.incentivePrograms.set('PROG-002', {
      id: 'PROG-002',
      name: 'Water Conservation Challenge',
      description: 'Reduce water usage by 30% while maintaining yield',
      tokenReward: 300,
      requirements: ['water_usage_tracking', '30_percent_reduction'],
      duration: '6 months',
      participants: 8,
      maxParticipants: 25,
      status: 'active'
    });

    this.incentivePrograms.set('PROG-003', {
      id: 'PROG-003',
      name: 'Carbon Sequestration Initiative',
      description: 'Implement carbon sequestration practices',
      tokenReward: 750,
      requirements: ['carbon_measurement', 'sequestration_practices'],
      duration: '18 months',
      participants: 12,
      maxParticipants: 30,
      status: 'active'
    });
  }

  generateReputationHistory() {
    const history = [];
    for (let i = 0; i < 12; i++) {
      history.push({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7),
        score: Math.floor(Math.random() * 20) + 75 + (i * 2) // Slight upward trend
      });
    }
    return history.reverse();
  }

  generateBadges() {
    const allBadges = [
      { id: 'organic-pioneer', name: 'Organic Pioneer', icon: '🌱', earned: true },
      { id: 'water-saver', name: 'Water Saver', icon: '💧', earned: Math.random() > 0.4 },
      { id: 'soil-guardian', name: 'Soil Guardian', icon: '🌍', earned: Math.random() > 0.5 },
      { id: 'carbon-hero', name: 'Carbon Hero', icon: '🌳', earned: Math.random() > 0.6 },
      { id: 'quality-master', name: 'Quality Master', icon: '⭐', earned: Math.random() > 0.3 },
      { id: 'innovation-leader', name: 'Innovation Leader', icon: '🚀', earned: Math.random() > 0.7 },
      { id: 'community-champion', name: 'Community Champion', icon: '🤝', earned: Math.random() > 0.5 }
    ];
    
    return allBadges.filter(badge => badge.earned);
  }

  calculateLevel(score) {
    if (score >= 95) return { level: 'Platinum', tier: 5, color: '#E5E7EB' };
    if (score >= 85) return { level: 'Gold', tier: 4, color: '#FCD34D' };
    if (score >= 75) return { level: 'Silver', tier: 3, color: '#9CA3AF' };
    if (score >= 65) return { level: 'Bronze', tier: 2, color: '#D97706' };
    return { level: 'Beginner', tier: 1, color: '#6B7280' };
  }

  /**
   * Calculate sustainability score for a farmer
   * @param {string} farmerId - Farmer ID
   * @returns {Object} Sustainability score breakdown
   */
  calculateSustainabilityScore(farmerId) {
    const metrics = this.sustainabilityMetrics.get(farmerId);
    if (!metrics) {
      throw new Error('Farmer metrics not found');
    }

    const scores = {
      organicCertification: metrics.organicCertified ? 100 : 0,
      waterConservation: Math.min(100, metrics.waterUsageReduction * 2),
      soilHealth: metrics.soilHealthScore,
      biodiversity: metrics.biodiversityIndex,
      carbonSequestration: Math.min(100, (metrics.carbonSequestration / 500) * 100),
      wasteReduction: metrics.wasteReduction
    };

    // Calculate weighted overall score
    let overallScore = 0;
    Object.keys(scores).forEach(key => {
      overallScore += (scores[key] * this.scoringWeights[key]) / 100;
    });

    return {
      overall: Math.round(overallScore),
      breakdown: scores,
      weights: this.scoringWeights,
      lastCalculated: new Date().toISOString(),
      recommendations: this.generateRecommendations(scores)
    };
  }

  generateRecommendations(scores) {
    const recommendations = [];
    
    if (scores.organicCertification === 0) {
      recommendations.push({
        category: 'Organic Certification',
        suggestion: 'Consider transitioning to organic practices for higher sustainability score',
        impact: 'High',
        tokenReward: 500
      });
    }

    if (scores.waterConservation < 60) {
      recommendations.push({
        category: 'Water Conservation',
        suggestion: 'Implement drip irrigation or rainwater harvesting',
        impact: 'Medium',
        tokenReward: 200
      });
    }

    if (scores.soilHealth < 80) {
      recommendations.push({
        category: 'Soil Health',
        suggestion: 'Use cover crops and reduce tillage to improve soil health',
        impact: 'High',
        tokenReward: 300
      });
    }

    if (scores.carbonSequestration < 70) {
      recommendations.push({
        category: 'Carbon Sequestration',
        suggestion: 'Plant trees or implement agroforestry practices',
        impact: 'High',
        tokenReward: 400
      });
    }

    return recommendations;
  }

  /**
   * Award green tokens for sustainable actions
   * @param {string} farmerId - Farmer ID
   * @param {string} action - Action type
   * @param {number} multiplier - Reward multiplier
   * @returns {Object} Token award result
   */
  awardGreenTokens(farmerId, action, multiplier = 1) {
    const baseReward = this.tokenRewards[action];
    if (!baseReward) {
      throw new Error(`Unknown action: ${action}`);
    }

    const tokens = this.greenTokens.get(farmerId);
    if (!tokens) {
      throw new Error('Farmer not found');
    }

    const reward = Math.floor(baseReward * multiplier);
    tokens.balance += reward;
    tokens.earned += reward;
    tokens.lastUpdated = new Date().toISOString();

    this.greenTokens.set(farmerId, tokens);

    // Update reputation score
    this.updateReputationScore(farmerId, action, reward);

    return {
      action,
      reward,
      newBalance: tokens.balance,
      totalEarned: tokens.earned,
      transactionId: this.generateTransactionId()
    };
  }

  /**
   * Update farmer reputation score
   * @param {string} farmerId - Farmer ID
   * @param {string} action - Action that triggered update
   * @param {number} tokenReward - Tokens awarded
   */
  updateReputationScore(farmerId, action, tokenReward) {
    const reputation = this.reputationScores.get(farmerId);
    if (!reputation) return;

    // Calculate reputation increase based on action and token reward
    const reputationIncrease = Math.floor(tokenReward / 10);
    
    // Update specific category based on action
    switch (action) {
      case 'organicHarvest':
        reputation.sustainability += Math.min(reputationIncrease, 2);
        break;
      case 'qualityCompliance':
        reputation.quality += Math.min(reputationIncrease, 2);
        reputation.compliance += Math.min(reputationIncrease, 1);
        break;
      case 'waterSaving':
      case 'carbonOffset':
        reputation.sustainability += Math.min(reputationIncrease, 2);
        reputation.innovation += Math.min(reputationIncrease, 1);
        break;
      default:
        reputation.overall += Math.min(reputationIncrease, 1);
    }

    // Recalculate overall score
    reputation.overall = Math.min(100, Math.round(
      (reputation.sustainability + reputation.quality + reputation.compliance + 
       reputation.innovation + reputation.community) / 5
    ));

    // Update level
    reputation.level = this.calculateLevel(reputation.overall);

    this.reputationScores.set(farmerId, reputation);
  }

  /**
   * Get farmer's green token balance and history
   * @param {string} farmerId - Farmer ID
   * @returns {Object} Token information
   */
  getGreenTokenBalance(farmerId) {
    const tokens = this.greenTokens.get(farmerId);
    if (!tokens) {
      throw new Error('Farmer not found');
    }

    return {
      ...tokens,
      exchangeRate: 0.05, // $0.05 per token
      usdValue: tokens.balance * 0.05,
      recentTransactions: this.generateRecentTransactions(farmerId)
    };
  }

  generateRecentTransactions(farmerId) {
    const transactions = [];
    const actions = Object.keys(this.tokenRewards);
    
    for (let i = 0; i < 5; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      transactions.push({
        id: this.generateTransactionId(),
        action,
        amount: this.tokenRewards[action],
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        type: 'earned'
      });
    }
    
    return transactions;
  }

  /**
   * Get farmer reputation and scoring details
   * @param {string} farmerId - Farmer ID
   * @returns {Object} Reputation information
   */
  getFarmerReputation(farmerId) {
    const reputation = this.reputationScores.get(farmerId);
    if (!reputation) {
      throw new Error('Farmer not found');
    }

    return {
      ...reputation,
      ranking: this.calculateRanking(farmerId),
      nextLevelRequirement: this.getNextLevelRequirement(reputation.overall),
      achievements: this.getAchievements(farmerId)
    };
  }

  calculateRanking(farmerId) {
    const allScores = Array.from(this.reputationScores.values())
      .map(rep => rep.overall)
      .sort((a, b) => b - a);
    
    const farmerScore = this.reputationScores.get(farmerId).overall;
    const rank = allScores.indexOf(farmerScore) + 1;
    
    return {
      rank,
      total: allScores.length,
      percentile: Math.round(((allScores.length - rank) / allScores.length) * 100)
    };
  }

  getNextLevelRequirement(currentScore) {
    const levels = [65, 75, 85, 95];
    const nextLevel = levels.find(level => level > currentScore);
    
    if (!nextLevel) {
      return { isMaxLevel: true };
    }
    
    return {
      requiredScore: nextLevel,
      pointsNeeded: nextLevel - currentScore,
      levelName: this.calculateLevel(nextLevel).level
    };
  }

  getAchievements(farmerId) {
    const reputation = this.reputationScores.get(farmerId);
    const tokens = this.greenTokens.get(farmerId);
    const metrics = this.sustainabilityMetrics.get(farmerId);
    
    const achievements = [];
    
    if (tokens.earned >= 1000) {
      achievements.push({
        id: 'token-collector',
        name: 'Token Collector',
        description: 'Earned 1000+ green tokens',
        icon: '🪙',
        unlockedAt: new Date().toISOString()
      });
    }
    
    if (reputation.overall >= 90) {
      achievements.push({
        id: 'sustainability-champion',
        name: 'Sustainability Champion',
        description: 'Achieved 90+ overall reputation score',
        icon: '🏆',
        unlockedAt: new Date().toISOString()
      });
    }
    
    if (metrics.organicCertified) {
      achievements.push({
        id: 'organic-certified',
        name: 'Organic Certified',
        description: 'Achieved organic certification',
        icon: '🌱',
        unlockedAt: new Date().toISOString()
      });
    }
    
    return achievements;
  }

  /**
   * Get available incentive programs
   * @returns {Array} List of active incentive programs
   */
  getIncentivePrograms() {
    return Array.from(this.incentivePrograms.values())
      .filter(program => program.status === 'active')
      .map(program => ({
        ...program,
        spotsRemaining: program.maxParticipants - program.participants,
        estimatedCompletion: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
  }

  /**
   * Enroll farmer in incentive program
   * @param {string} farmerId - Farmer ID
   * @param {string} programId - Program ID
   * @returns {Object} Enrollment result
   */
  enrollInProgram(farmerId, programId) {
    const program = this.incentivePrograms.get(programId);
    if (!program) {
      throw new Error('Program not found');
    }
    
    if (program.participants >= program.maxParticipants) {
      throw new Error('Program is full');
    }
    
    program.participants += 1;
    this.incentivePrograms.set(programId, program);
    
    return {
      success: true,
      program: program.name,
      enrollmentId: this.generateTransactionId(),
      expectedReward: program.tokenReward,
      requirements: program.requirements
    };
  }

  /**
   * Get carbon credit information for farmer
   * @param {string} farmerId - Farmer ID
   * @returns {Object} Carbon credit data
   */
  getCarbonCredits(farmerId) {
    const credits = this.carbonCredits.get(farmerId);
    if (!credits) {
      throw new Error('Farmer not found');
    }
    
    return {
      ...credits,
      marketValue: credits.availableCredits * credits.pricePerCredit,
      projectedValue: credits.projectedAnnual * credits.pricePerCredit,
      carbonFootprint: this.calculateCarbonFootprint(farmerId)
    };
  }

  calculateCarbonFootprint(farmerId) {
    const metrics = this.sustainabilityMetrics.get(farmerId);
    if (!metrics) return null;
    
    // Mock carbon footprint calculation
    const baseFootprint = 1000; // kg CO2/year
    const reductions = {
      organic: metrics.organicCertified ? 200 : 0,
      renewable: (metrics.renewableEnergyUse / 100) * 300,
      efficiency: (metrics.wasteReduction / 100) * 150
    };
    
    const totalReduction = Object.values(reductions).reduce((sum, val) => sum + val, 0);
    const netFootprint = Math.max(0, baseFootprint - totalReduction);
    
    return {
      gross: baseFootprint,
      reductions,
      net: netFootprint,
      sequestered: metrics.carbonSequestration,
      netImpact: metrics.carbonSequestration - netFootprint
    };
  }

  /**
   * Get sustainability dashboard data
   * @returns {Object} Dashboard statistics
   */
  getSustainabilityDashboard() {
    const allFarmers = Array.from(this.sustainabilityMetrics.keys());
    const totalTokens = Array.from(this.greenTokens.values())
      .reduce((sum, tokens) => sum + tokens.balance, 0);
    
    const organicFarmers = allFarmers.filter(id => 
      this.sustainabilityMetrics.get(id).organicCertified
    ).length;
    
    const totalCarbonCredits = Array.from(this.carbonCredits.values())
      .reduce((sum, credits) => sum + credits.totalCredits, 0);
    
    const avgSustainabilityScore = allFarmers
      .map(id => this.calculateSustainabilityScore(id).overall)
      .reduce((sum, score) => sum + score, 0) / allFarmers.length;
    
    return {
      totalFarmers: allFarmers.length,
      organicFarmers,
      organicPercentage: Math.round((organicFarmers / allFarmers.length) * 100),
      totalGreenTokens: totalTokens,
      totalCarbonCredits,
      avgSustainabilityScore: Math.round(avgSustainabilityScore),
      activePrograms: Array.from(this.incentivePrograms.values())
        .filter(p => p.status === 'active').length,
      topPerformers: this.getTopPerformers()
    };
  }

  getTopPerformers() {
    return Array.from(this.reputationScores.entries())
      .sort(([,a], [,b]) => b.overall - a.overall)
      .slice(0, 5)
      .map(([farmerId, reputation]) => ({
        farmerId,
        score: reputation.overall,
        level: reputation.level.level,
        badges: reputation.badges.length
      }));
  }

  // Helper methods
  generateTransactionId() {
    return 'TXN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
}

module.exports = new SustainabilityService();
