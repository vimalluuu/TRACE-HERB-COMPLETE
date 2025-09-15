const express = require('express');
const sustainabilityService = require('../services/sustainabilityService');
const router = express.Router();

/**
 * GET /api/sustainability/score/:farmerId
 * Get sustainability score for a farmer
 */
router.get('/score/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const score = sustainabilityService.calculateSustainabilityScore(farmerId);
    
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Sustainability score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate sustainability score',
      message: error.message
    });
  }
});

/**
 * POST /api/sustainability/award-tokens
 * Award green tokens for sustainable actions
 */
router.post('/award-tokens', async (req, res) => {
  try {
    const { farmerId, action, multiplier = 1 } = req.body;
    
    if (!farmerId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and action are required'
      });
    }
    
    const result = sustainabilityService.awardGreenTokens(farmerId, action, multiplier);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Token award error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award tokens',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/tokens/:farmerId
 * Get farmer's green token balance and history
 */
router.get('/tokens/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const tokens = sustainabilityService.getGreenTokenBalance(farmerId);
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Token balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token balance',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/reputation/:farmerId
 * Get farmer reputation and scoring details
 */
router.get('/reputation/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const reputation = sustainabilityService.getFarmerReputation(farmerId);
    
    res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    console.error('Reputation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get farmer reputation',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/programs
 * Get available incentive programs
 */
router.get('/programs', async (req, res) => {
  try {
    const programs = sustainabilityService.getIncentivePrograms();
    
    res.json({
      success: true,
      data: {
        programs,
        count: programs.length
      }
    });
  } catch (error) {
    console.error('Programs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get incentive programs',
      message: error.message
    });
  }
});

/**
 * POST /api/sustainability/enroll
 * Enroll farmer in incentive program
 */
router.post('/enroll', async (req, res) => {
  try {
    const { farmerId, programId } = req.body;
    
    if (!farmerId || !programId) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and Program ID are required'
      });
    }
    
    const result = sustainabilityService.enrollInProgram(farmerId, programId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enroll in program',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/carbon-credits/:farmerId
 * Get carbon credit information for farmer
 */
router.get('/carbon-credits/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const credits = sustainabilityService.getCarbonCredits(farmerId);
    
    res.json({
      success: true,
      data: credits
    });
  } catch (error) {
    console.error('Carbon credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get carbon credits',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/dashboard
 * Get sustainability dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = sustainabilityService.getSustainabilityDashboard();
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      message: error.message
    });
  }
});

/**
 * POST /api/sustainability/simulate-action
 * Simulate sustainable action for demo purposes
 */
router.post('/simulate-action', async (req, res) => {
  try {
    const { farmerId, actionType } = req.body;
    
    if (!farmerId || !actionType) {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID and action type are required'
      });
    }
    
    // Simulate the action with random multiplier
    const multiplier = Math.random() * 0.5 + 0.75; // 0.75 - 1.25
    const result = sustainabilityService.awardGreenTokens(farmerId, actionType, multiplier);
    
    // Get updated reputation
    const reputation = sustainabilityService.getFarmerReputation(farmerId);
    
    res.json({
      success: true,
      data: {
        tokenReward: result,
        updatedReputation: reputation,
        actionSimulated: actionType,
        multiplier: Math.round(multiplier * 100) / 100
      }
    });
  } catch (error) {
    console.error('Action simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate action',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/leaderboard
 * Get sustainability leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, category = 'overall' } = req.query;
    
    // Get all farmers and their reputation scores
    const farmers = [];
    for (const [farmerId, reputation] of sustainabilityService.reputationScores.entries()) {
      farmers.push({
        farmerId,
        name: `Farmer ${farmerId.split('-')[1]}`, // Mock name
        score: reputation[category] || reputation.overall,
        level: reputation.level,
        badges: reputation.badges.length,
        tokens: sustainabilityService.greenTokens.get(farmerId)?.balance || 0
      });
    }
    
    // Sort by score and limit results
    const leaderboard = farmers
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        leaderboard,
        category,
        totalFarmers: farmers.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard',
      message: error.message
    });
  }
});

/**
 * GET /api/sustainability/token-rewards
 * Get available token reward actions and rates
 */
router.get('/token-rewards', async (req, res) => {
  try {
    const rewards = sustainabilityService.tokenRewards;
    const rewardActions = Object.keys(rewards).map(action => ({
      action,
      baseReward: rewards[action],
      description: getActionDescription(action),
      category: getActionCategory(action),
      difficulty: getActionDifficulty(action)
    }));
    
    res.json({
      success: true,
      data: {
        actions: rewardActions,
        totalActions: rewardActions.length,
        maxReward: Math.max(...Object.values(rewards)),
        minReward: Math.min(...Object.values(rewards))
      }
    });
  } catch (error) {
    console.error('Token rewards error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token rewards',
      message: error.message
    });
  }
});

// Helper functions
function getActionDescription(action) {
  const descriptions = {
    organicHarvest: 'Harvest from certified organic practices',
    waterSaving: 'Implement water conservation measures',
    soilImprovement: 'Improve soil health through sustainable practices',
    biodiversityAction: 'Actions that promote biodiversity',
    carbonOffset: 'Carbon sequestration and offset activities',
    wasteReduction: 'Reduce agricultural waste',
    qualityCompliance: 'Meet quality standards and certifications',
    timelyReporting: 'Submit reports and data on time'
  };
  return descriptions[action] || 'Sustainable farming action';
}

function getActionCategory(action) {
  const categories = {
    organicHarvest: 'Organic Practices',
    waterSaving: 'Water Management',
    soilImprovement: 'Soil Health',
    biodiversityAction: 'Biodiversity',
    carbonOffset: 'Carbon Management',
    wasteReduction: 'Waste Management',
    qualityCompliance: 'Quality Assurance',
    timelyReporting: 'Data Management'
  };
  return categories[action] || 'General';
}

function getActionDifficulty(action) {
  const difficulties = {
    organicHarvest: 'High',
    waterSaving: 'Medium',
    soilImprovement: 'High',
    biodiversityAction: 'Medium',
    carbonOffset: 'High',
    wasteReduction: 'Low',
    qualityCompliance: 'Medium',
    timelyReporting: 'Low'
  };
  return difficulties[action] || 'Medium';
}

module.exports = router;
