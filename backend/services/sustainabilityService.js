const fs = require('fs');
const path = require('path');

/**
 * Sustainability & Incentives Service
 * Handles Green Token economy, reputation scoring, and carbon credits marketplace
 */
class SustainabilityService {
  constructor() {
    // Green Token Configuration
    this.greenToken = {
      name: 'Green Herb Token',
      symbol: 'GHT',
      decimals: 18,
      totalSupply: 1000000000, // 1 billion tokens
      contractAddress: '0x1234567890123456789012345678901234567890' // Mock address
    };

    // Reward rates (tokens per action)
    this.rewardRates = {
      organicCertification: 100,
      qualityGrade: {
        'A+': 50,
        'A': 40,
        'B+': 30,
        'B': 20,
        'C': 10
      },
      sustainablePractices: {
        waterConservation: 25,
        soilHealth: 30,
        biodiversity: 35,
        renewableEnergy: 40,
        wasteReduction: 20
      },
      traceabilityCompliance: 15,
      timelyReporting: 10,
      communityEngagement: 20,
      carbonSequestration: 5 // per kg CO2 equivalent
    };

    // Reputation scoring weights
    this.reputationWeights = {
      qualityConsistency: 0.25,
      sustainabilityPractices: 0.20,
      traceabilityCompliance: 0.15,
      timelyDelivery: 0.15,
      certificationMaintenance: 0.10,
      communityImpact: 0.10,
      innovationAdoption: 0.05
    };

    // Carbon credit rates (per practice)
    this.carbonCreditRates = {
      organicFarming: 2.5, // tons CO2/hectare/year
      agroforestry: 5.0,
      coverCropping: 1.8,
      composting: 1.2,
      renewableEnergy: 3.0,
      waterConservation: 0.8
    };

    // Mock databases
    this.farmerProfiles = new Map();
    this.tokenBalances = new Map();
    this.reputationScores = new Map();
    this.carbonCredits = new Map();
    this.transactionHistory = [];
  }

  /**
   * Calculate and award Green Tokens for farmer actions
   * @param {string} farmerId - Farmer identifier
   * @param {object} actionData - Action details
   * @returns {object} Token reward result
   */
  async awardGreenTokens(farmerId, actionData) {
    try {
      let tokensEarned = 0;
      const rewardBreakdown = [];

      // Calculate tokens based on action type
      switch (actionData.type) {
        case 'harvest':
          tokensEarned += this.calculateHarvestReward(actionData);
          rewardBreakdown.push({
            category: 'Quality Grade',
            tokens: this.rewardRates.qualityGrade[actionData.qualityGrade] || 0,
            details: `Grade ${actionData.qualityGrade}`
          });
          break;

        case 'certification':
          if (actionData.certificationType === 'organic') {
            tokensEarned += this.rewardRates.organicCertification;
            rewardBreakdown.push({
              category: 'Organic Certification',
              tokens: this.rewardRates.organicCertification,
              details: 'New organic certification obtained'
            });
          }
          break;

        case 'sustainability':
          for (const practice of actionData.practices) {
            const practiceTokens = this.rewardRates.sustainablePractices[practice] || 0;
            tokensEarned += practiceTokens;
            rewardBreakdown.push({
              category: 'Sustainable Practice',
              tokens: practiceTokens,
              details: practice
            });
          }
          break;

        case 'compliance':
          tokensEarned += this.rewardRates.traceabilityCompliance;
          rewardBreakdown.push({
            category: 'Traceability Compliance',
            tokens: this.rewardRates.traceabilityCompliance,
            details: 'Complete traceability data provided'
          });
          break;

        case 'reporting':
          if (actionData.timely) {
            tokensEarned += this.rewardRates.timelyReporting;
            rewardBreakdown.push({
              category: 'Timely Reporting',
              tokens: this.rewardRates.timelyReporting,
              details: 'Report submitted on time'
            });
          }
          break;

        case 'community':
          tokensEarned += this.rewardRates.communityEngagement;
          rewardBreakdown.push({
            category: 'Community Engagement',
            tokens: this.rewardRates.communityEngagement,
            details: actionData.activity
          });
          break;

        case 'carbon':
          const carbonTokens = actionData.co2Sequestered * this.rewardRates.carbonSequestration;
          tokensEarned += carbonTokens;
          rewardBreakdown.push({
            category: 'Carbon Sequestration',
            tokens: carbonTokens,
            details: `${actionData.co2Sequestered}kg CO2 sequestered`
          });
          break;
      }

      // Update farmer's token balance
      const currentBalance = this.tokenBalances.get(farmerId) || 0;
      const newBalance = currentBalance + tokensEarned;
      this.tokenBalances.set(farmerId, newBalance);

      // Record transaction
      const transaction = {
        id: this.generateTransactionId(),
        farmerId,
        type: 'reward',
        amount: tokensEarned,
        actionType: actionData.type,
        rewardBreakdown,
        timestamp: new Date().toISOString(),
        blockchainTxHash: this.generateMockTxHash()
      };

      this.transactionHistory.push(transaction);

      return {
        success: true,
        tokensEarned,
        newBalance,
        rewardBreakdown,
        transaction,
        message: `Congratulations! You earned ${tokensEarned} GHT tokens.`
      };

    } catch (error) {
      console.error('Token Award Error:', error);
      return {
        success: false,
        error: error.message,
        tokensEarned: 0
      };
    }
  }

  /**
   * Calculate farmer reputation score
   * @param {string} farmerId - Farmer identifier
   * @param {object} performanceData - Performance metrics
   * @returns {object} Reputation calculation result
   */
  async calculateReputationScore(farmerId, performanceData) {
    try {
      let totalScore = 0;
      const scoreBreakdown = [];

      // Quality Consistency (25%)
      const qualityScore = this.calculateQualityConsistency(performanceData.qualityHistory);
      totalScore += qualityScore * this.reputationWeights.qualityConsistency;
      scoreBreakdown.push({
        category: 'Quality Consistency',
        score: qualityScore,
        weight: this.reputationWeights.qualityConsistency,
        contribution: qualityScore * this.reputationWeights.qualityConsistency
      });

      // Sustainability Practices (20%)
      const sustainabilityScore = this.calculateSustainabilityScore(performanceData.sustainabilityPractices);
      totalScore += sustainabilityScore * this.reputationWeights.sustainabilityPractices;
      scoreBreakdown.push({
        category: 'Sustainability Practices',
        score: sustainabilityScore,
        weight: this.reputationWeights.sustainabilityPractices,
        contribution: sustainabilityScore * this.reputationWeights.sustainabilityPractices
      });

      // Traceability Compliance (15%)
      const complianceScore = this.calculateComplianceScore(performanceData.complianceHistory);
      totalScore += complianceScore * this.reputationWeights.traceabilityCompliance;
      scoreBreakdown.push({
        category: 'Traceability Compliance',
        score: complianceScore,
        weight: this.reputationWeights.traceabilityCompliance,
        contribution: complianceScore * this.reputationWeights.traceabilityCompliance
      });

      // Timely Delivery (15%)
      const deliveryScore = this.calculateDeliveryScore(performanceData.deliveryHistory);
      totalScore += deliveryScore * this.reputationWeights.timelyDelivery;
      scoreBreakdown.push({
        category: 'Timely Delivery',
        score: deliveryScore,
        weight: this.reputationWeights.timelyDelivery,
        contribution: deliveryScore * this.reputationWeights.timelyDelivery
      });

      // Certification Maintenance (10%)
      const certificationScore = this.calculateCertificationScore(performanceData.certifications);
      totalScore += certificationScore * this.reputationWeights.certificationMaintenance;
      scoreBreakdown.push({
        category: 'Certification Maintenance',
        score: certificationScore,
        weight: this.reputationWeights.certificationMaintenance,
        contribution: certificationScore * this.reputationWeights.certificationMaintenance
      });

      // Community Impact (10%)
      const communityScore = this.calculateCommunityScore(performanceData.communityEngagement);
      totalScore += communityScore * this.reputationWeights.communityImpact;
      scoreBreakdown.push({
        category: 'Community Impact',
        score: communityScore,
        weight: this.reputationWeights.communityImpact,
        contribution: communityScore * this.reputationWeights.communityImpact
      });

      // Innovation Adoption (5%)
      const innovationScore = this.calculateInnovationScore(performanceData.technologyAdoption);
      totalScore += innovationScore * this.reputationWeights.innovationAdoption;
      scoreBreakdown.push({
        category: 'Innovation Adoption',
        score: innovationScore,
        weight: this.reputationWeights.innovationAdoption,
        contribution: innovationScore * this.reputationWeights.innovationAdoption
      });

      // Normalize to 0-100 scale
      const finalScore = Math.min(100, Math.max(0, totalScore));

      // Update reputation database
      this.reputationScores.set(farmerId, {
        score: finalScore,
        scoreBreakdown,
        lastUpdated: new Date().toISOString(),
        trend: this.calculateScoreTrend(farmerId, finalScore)
      });

      return {
        success: true,
        farmerId,
        reputationScore: finalScore,
        scoreBreakdown,
        badge: this.getReputationBadge(finalScore),
        recommendations: this.generateReputationRecommendations(scoreBreakdown)
      };

    } catch (error) {
      console.error('Reputation Calculation Error:', error);
      return {
        success: false,
        error: error.message,
        reputationScore: 0
      };
    }
  }

  /**
   * Calculate carbon credits for sustainable practices
   * @param {string} farmerId - Farmer identifier
   * @param {object} practiceData - Sustainable practice data
   * @returns {object} Carbon credit calculation result
   */
  async calculateCarbonCredits(farmerId, practiceData) {
    try {
      let totalCredits = 0;
      const creditBreakdown = [];

      for (const practice of practiceData.practices) {
        const creditRate = this.carbonCreditRates[practice.type] || 0;
        const practiceCredits = creditRate * practice.area * practice.duration;
        
        totalCredits += practiceCredits;
        creditBreakdown.push({
          practice: practice.type,
          area: practice.area,
          duration: practice.duration,
          rate: creditRate,
          credits: practiceCredits,
          co2Equivalent: practiceCredits
        });
      }

      // Update carbon credits database
      const currentCredits = this.carbonCredits.get(farmerId) || 0;
      const newCredits = currentCredits + totalCredits;
      this.carbonCredits.set(farmerId, newCredits);

      // Calculate market value (mock price: $15 per credit)
      const marketValue = totalCredits * 15;

      return {
        success: true,
        farmerId,
        creditsEarned: totalCredits,
        totalCredits: newCredits,
        creditBreakdown,
        marketValue,
        currency: 'USD',
        certificationStandard: 'Verified Carbon Standard (VCS)',
        validityPeriod: '2024-2031'
      };

    } catch (error) {
      console.error('Carbon Credit Calculation Error:', error);
      return {
        success: false,
        error: error.message,
        creditsEarned: 0
      };
    }
  }

  // Helper methods for calculations
  calculateHarvestReward(actionData) {
    const baseReward = this.rewardRates.qualityGrade[actionData.qualityGrade] || 0;
    const quantityBonus = Math.min(50, actionData.quantity * 2); // Max 50 bonus tokens
    return baseReward + quantityBonus;
  }

  calculateQualityConsistency(qualityHistory) {
    if (!qualityHistory || qualityHistory.length === 0) return 50;
    
    const gradeValues = { 'A+': 100, 'A': 90, 'B+': 80, 'B': 70, 'C': 60 };
    const scores = qualityHistory.map(grade => gradeValues[grade] || 50);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate consistency (lower variance = higher consistency)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const consistency = Math.max(0, 100 - variance / 10);
    
    return (average + consistency) / 2;
  }

  calculateSustainabilityScore(practices) {
    if (!practices || practices.length === 0) return 30;
    
    const maxPractices = Object.keys(this.rewardRates.sustainablePractices).length;
    const adoptionRate = practices.length / maxPractices;
    
    return Math.min(100, adoptionRate * 100 + 20); // Base 20 points + adoption bonus
  }

  calculateComplianceScore(complianceHistory) {
    if (!complianceHistory || complianceHistory.length === 0) return 50;
    
    const compliantCount = complianceHistory.filter(record => record.compliant).length;
    return (compliantCount / complianceHistory.length) * 100;
  }

  calculateDeliveryScore(deliveryHistory) {
    if (!deliveryHistory || deliveryHistory.length === 0) return 50;
    
    const onTimeCount = deliveryHistory.filter(delivery => delivery.onTime).length;
    return (onTimeCount / deliveryHistory.length) * 100;
  }

  calculateCertificationScore(certifications) {
    if (!certifications || certifications.length === 0) return 20;
    
    const activeCertifications = certifications.filter(cert => cert.active).length;
    return Math.min(100, activeCertifications * 25); // 25 points per active certification
  }

  calculateCommunityScore(engagement) {
    if (!engagement) return 30;
    
    let score = 0;
    if (engagement.trainingParticipation) score += 30;
    if (engagement.knowledgeSharing) score += 25;
    if (engagement.cooperativeMembership) score += 25;
    if (engagement.mentorship) score += 20;
    
    return Math.min(100, score);
  }

  calculateInnovationScore(technologyAdoption) {
    if (!technologyAdoption) return 20;
    
    let score = 0;
    if (technologyAdoption.blockchainUsage) score += 30;
    if (technologyAdoption.iotDevices) score += 25;
    if (technologyAdoption.mobileApps) score += 20;
    if (technologyAdoption.precisionAgriculture) score += 25;
    
    return Math.min(100, score);
  }

  calculateScoreTrend(farmerId, currentScore) {
    const previousScore = this.reputationScores.get(farmerId)?.score || currentScore;
    const change = currentScore - previousScore;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  getReputationBadge(score) {
    if (score >= 90) return { name: 'Platinum Farmer', color: '#E5E7EB', icon: '🏆' };
    if (score >= 80) return { name: 'Gold Farmer', color: '#FCD34D', icon: '🥇' };
    if (score >= 70) return { name: 'Silver Farmer', color: '#D1D5DB', icon: '🥈' };
    if (score >= 60) return { name: 'Bronze Farmer', color: '#CD7C2F', icon: '🥉' };
    return { name: 'Developing Farmer', color: '#9CA3AF', icon: '🌱' };
  }

  generateReputationRecommendations(scoreBreakdown) {
    const recommendations = [];
    
    scoreBreakdown.forEach(category => {
      if (category.score < 70) {
        switch (category.category) {
          case 'Quality Consistency':
            recommendations.push('Focus on maintaining consistent quality grades across harvests');
            break;
          case 'Sustainability Practices':
            recommendations.push('Adopt more sustainable farming practices like water conservation');
            break;
          case 'Traceability Compliance':
            recommendations.push('Ensure complete and timely submission of traceability data');
            break;
          case 'Timely Delivery':
            recommendations.push('Improve delivery scheduling and communication');
            break;
          case 'Certification Maintenance':
            recommendations.push('Maintain active certifications and consider obtaining new ones');
            break;
          case 'Community Impact':
            recommendations.push('Increase participation in community training and knowledge sharing');
            break;
          case 'Innovation Adoption':
            recommendations.push('Explore new technologies like IoT devices and mobile apps');
            break;
        }
      }
    });
    
    return recommendations;
  }

  generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateMockTxHash() {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Statistics and monitoring
  getSustainabilityStats() {
    const totalTokensIssued = Array.from(this.tokenBalances.values()).reduce((sum, balance) => sum + balance, 0);
    const totalCarbonCredits = Array.from(this.carbonCredits.values()).reduce((sum, credits) => sum + credits, 0);
    const averageReputation = Array.from(this.reputationScores.values()).reduce((sum, data) => sum + data.score, 0) / this.reputationScores.size || 0;

    return {
      totalFarmers: this.farmerProfiles.size,
      totalTokensIssued,
      totalCarbonCredits,
      averageReputation: Math.round(averageReputation),
      totalTransactions: this.transactionHistory.length,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new SustainabilityService();
