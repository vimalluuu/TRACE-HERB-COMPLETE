const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    // Mock AI service - in production, this would connect to actual AI models
    this.plantDatabase = {
      'Ashwagandha': {
        scientificName: 'Withania somnifera',
        characteristics: ['oval leaves', 'small greenish flowers', 'orange-red berries'],
        commonMistakes: ['Physalis', 'Solanum'],
        confidence: 0.95
      },
      'Turmeric': {
        scientificName: 'Curcuma longa',
        characteristics: ['lance-shaped leaves', 'yellow rhizome', 'white/pink flowers'],
        commonMistakes: ['Ginger', 'Galangal'],
        confidence: 0.92
      },
      'Neem': {
        scientificName: 'Azadirachta indica',
        characteristics: ['compound leaves', 'small white flowers', 'olive-like fruits'],
        commonMistakes: ['Margosa', 'Chinaberry'],
        confidence: 0.88
      },
      'Tulsi': {
        scientificName: 'Ocimum tenuiflorum',
        characteristics: ['aromatic leaves', 'purple/white flowers', 'small seeds'],
        commonMistakes: ['Sweet Basil', 'Thai Basil'],
        confidence: 0.90
      }
    };

    this.suspiciousPatterns = {
      volumeThreshold: 100, // kg per day per farmer
      locationRadius: 50, // km from registered location
      timeWindow: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      qualityDropThreshold: 2 // grade levels (A to C)
    };
  }

  /**
   * AI-powered plant verification from image
   * @param {Buffer|string} imageData - Image buffer or base64 string
   * @param {string} claimedSpecies - What the farmer claims the plant is
   * @param {Object} location - GPS coordinates
   * @returns {Object} Verification result
   */
  async verifyPlantSpecies(imageData, claimedSpecies, location = null) {
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI analysis - in production, this would use TensorFlow/PyTorch models
      const plantInfo = this.plantDatabase[claimedSpecies];
      
      if (!plantInfo) {
        return {
          success: false,
          confidence: 0.0,
          species: 'Unknown',
          message: 'Species not in our database. Manual verification required.',
          recommendations: ['Submit to expert botanist', 'Provide additional samples']
        };
      }

      // Simulate AI confidence based on various factors
      let confidence = plantInfo.confidence;
      
      // Adjust confidence based on location (some plants grow better in certain regions)
      if (location) {
        if (this.isOptimalGrowingRegion(claimedSpecies, location)) {
          confidence += 0.03;
        } else {
          confidence -= 0.05;
        }
      }

      // Add some randomness to simulate real AI uncertainty
      confidence += (Math.random() - 0.5) * 0.1;
      confidence = Math.max(0, Math.min(1, confidence));

      const isVerified = confidence >= 0.85;
      
      return {
        success: true,
        verified: isVerified,
        confidence: Math.round(confidence * 100) / 100,
        species: claimedSpecies,
        scientificName: plantInfo.scientificName,
        characteristics: plantInfo.characteristics,
        message: isVerified 
          ? `Plant verified as ${claimedSpecies} with ${Math.round(confidence * 100)}% confidence`
          : `Low confidence (${Math.round(confidence * 100)}%). Manual verification recommended.`,
        recommendations: isVerified 
          ? ['Proceed with harvest', 'Record GPS location', 'Document environmental conditions']
          : ['Get expert verification', 'Provide clearer images', 'Check for common look-alikes'],
        potentialMistakes: plantInfo.commonMistakes,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Plant Verification Error:', error);
      return {
        success: false,
        error: 'AI service temporarily unavailable',
        message: 'Please try again later or proceed with manual verification'
      };
    }
  }

  /**
   * Anomaly detection for blockchain entries
   * @param {Object} newEntry - New harvest/processing entry
   * @param {Array} historicalData - Previous entries from same farmer/processor
   * @returns {Object} Anomaly analysis result
   */
  async detectAnomalies(newEntry, historicalData = []) {
    try {
      const anomalies = [];
      const warnings = [];
      let riskScore = 0;

      // Volume anomaly detection
      const recentEntries = historicalData.filter(entry => 
        Date.now() - new Date(entry.timestamp).getTime() < this.suspiciousPatterns.timeWindow
      );
      
      const totalRecentVolume = recentEntries.reduce((sum, entry) => 
        sum + (entry.quantity || 0), 0
      );
      
      if (totalRecentVolume + newEntry.quantity > this.suspiciousPatterns.volumeThreshold) {
        anomalies.push({
          type: 'VOLUME_SPIKE',
          severity: 'HIGH',
          message: `Unusually high harvest volume: ${totalRecentVolume + newEntry.quantity}kg in 24h`,
          recommendation: 'Verify with field inspection'
        });
        riskScore += 30;
      }

      // Location anomaly detection
      if (newEntry.location && historicalData.length > 0) {
        const avgLocation = this.calculateAverageLocation(historicalData);
        const distance = this.calculateDistance(newEntry.location, avgLocation);
        
        if (distance > this.suspiciousPatterns.locationRadius) {
          anomalies.push({
            type: 'LOCATION_ANOMALY',
            severity: 'MEDIUM',
            message: `Harvest location ${distance}km from usual area`,
            recommendation: 'Verify farmer registration and land ownership'
          });
          riskScore += 20;
        }
      }

      // Quality pattern analysis
      if (historicalData.length >= 3) {
        const recentQuality = historicalData.slice(-3).map(entry => 
          this.gradeToNumber(entry.quality || 'B')
        );
        const avgQuality = recentQuality.reduce((a, b) => a + b, 0) / recentQuality.length;
        const newQuality = this.gradeToNumber(newEntry.quality || 'B');
        
        if (avgQuality - newQuality >= this.suspiciousPatterns.qualityDropThreshold) {
          warnings.push({
            type: 'QUALITY_DROP',
            severity: 'LOW',
            message: 'Significant quality drop detected',
            recommendation: 'Check harvesting and storage practices'
          });
          riskScore += 10;
        }
      }

      // Time pattern analysis
      const harvestHour = new Date(newEntry.timestamp).getHours();
      if (harvestHour < 5 || harvestHour > 20) {
        warnings.push({
          type: 'UNUSUAL_TIME',
          severity: 'LOW',
          message: 'Harvest recorded at unusual time',
          recommendation: 'Verify timestamp accuracy'
        });
        riskScore += 5;
      }

      // Seasonal analysis
      const month = new Date(newEntry.timestamp).getMonth();
      if (!this.isOptimalHarvestSeason(newEntry.species, month)) {
        warnings.push({
          type: 'OFF_SEASON',
          severity: 'MEDIUM',
          message: 'Harvest outside optimal season',
          recommendation: 'Verify species identification and growing conditions'
        });
        riskScore += 15;
      }

      return {
        success: true,
        riskScore: Math.min(100, riskScore),
        riskLevel: this.getRiskLevel(riskScore),
        anomalies,
        warnings,
        recommendation: this.getOverallRecommendation(riskScore, anomalies, warnings),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Anomaly Detection Error:', error);
      return {
        success: false,
        error: 'Anomaly detection service unavailable'
      };
    }
  }

  /**
   * Voice-to-blockchain transcription and validation
   * @param {Buffer} audioData - Audio buffer
   * @param {string} farmerId - Farmer ID for context
   * @returns {Object} Transcription and validation result
   */
  async processVoiceInput(audioData, farmerId) {
    try {
      // Simulate voice processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock voice transcription - in production, use Google Speech-to-Text or similar
      const mockTranscriptions = [
        "Ashwagandha, 15 kilograms, latitude 12.9716, longitude 77.5946, harvested this morning",
        "Turmeric, 25 kg, GPS location 12.8797, 77.5912, good quality, organic",
        "Neem leaves, 8 kilograms, collected from farm plot number 3, coordinates 12.9352, 77.6245"
      ];

      const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      // Parse the transcription using NLP
      const parsedData = this.parseVoiceTranscription(transcription);
      
      // Validate the parsed data
      const validation = await this.validateVoiceEntry(parsedData, farmerId);

      return {
        success: true,
        transcription,
        parsedData,
        validation,
        confidence: 0.87,
        language: 'en-IN', // English (India)
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Voice Processing Error:', error);
      return {
        success: false,
        error: 'Voice processing service unavailable'
      };
    }
  }

  // Helper methods
  isOptimalGrowingRegion(species, location) {
    // Mock regional suitability - in production, use actual botanical data
    const optimalRegions = {
      'Ashwagandha': { lat: [10, 25], lng: [70, 85] }, // Northern India
      'Turmeric': { lat: [8, 20], lng: [75, 85] }, // Southern India
      'Neem': { lat: [8, 30], lng: [68, 88] }, // All India
      'Tulsi': { lat: [10, 28], lng: [70, 88] } // Most of India
    };

    const region = optimalRegions[species];
    if (!region) return true;

    return location.lat >= region.lat[0] && location.lat <= region.lat[1] &&
           location.lng >= region.lng[0] && location.lng <= region.lng[1];
  }

  calculateAverageLocation(entries) {
    const locations = entries.filter(e => e.location).map(e => e.location);
    if (locations.length === 0) return { lat: 0, lng: 0 };

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    
    return { lat: avgLat, lng: avgLng };
  }

  calculateDistance(loc1, loc2) {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  gradeToNumber(grade) {
    const gradeMap = { 'A+': 5, 'A': 4, 'B+': 3, 'B': 2, 'C': 1 };
    return gradeMap[grade] || 2;
  }

  getRiskLevel(score) {
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  getOverallRecommendation(riskScore, anomalies, warnings) {
    if (riskScore >= 50) {
      return 'BLOCK_ENTRY - High risk detected. Manual verification required before blockchain entry.';
    }
    if (riskScore >= 25) {
      return 'FLAG_FOR_REVIEW - Medium risk. Additional verification recommended.';
    }
    return 'PROCEED - Low risk. Entry can be processed normally.';
  }

  isOptimalHarvestSeason(species, month) {
    // Mock seasonal data - in production, use actual botanical calendars
    const seasons = {
      'Ashwagandha': [10, 11, 0, 1], // Oct-Jan
      'Turmeric': [0, 1, 2, 3], // Jan-Apr
      'Neem': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Year-round
      'Tulsi': [2, 3, 4, 5, 6, 7, 8, 9] // Mar-Oct
    };
    
    return seasons[species]?.includes(month) || false;
  }

  parseVoiceTranscription(text) {
    // Simple NLP parsing - in production, use more sophisticated NLP
    const patterns = {
      species: /^([A-Za-z]+)/,
      quantity: /(\d+(?:\.\d+)?)\s*(kg|kilograms?|grams?)/i,
      latitude: /latitude\s+(\d+(?:\.\d+)?)/i,
      longitude: /longitude\s+(\d+(?:\.\d+)?)/i,
      quality: /(good|excellent|poor|average|premium)/i
    };

    const result = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        result[key] = key === 'quantity' ? parseFloat(match[1]) : match[1];
      }
    }

    return result;
  }

  async validateVoiceEntry(parsedData, farmerId) {
    // Validate the parsed voice data
    const errors = [];
    const warnings = [];

    if (!parsedData.species) {
      errors.push('Species not identified in voice input');
    }

    if (!parsedData.quantity || parsedData.quantity <= 0) {
      errors.push('Invalid or missing quantity');
    }

    if (!parsedData.latitude || !parsedData.longitude) {
      warnings.push('GPS coordinates not provided - using farmer registered location');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence: errors.length === 0 ? 0.9 : 0.3
    };
  }
}

module.exports = new AIService();
