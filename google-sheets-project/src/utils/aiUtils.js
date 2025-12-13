/**
 * AI Utilities - Helper functions for AI/ML operations
 * MIA.vn Google Integration Platform
 */

import { SLR } from 'ml-regression'
import * as stats from 'simple-statistics'

/**
 * Data preprocessing utilities
 */
export class AIDataProcessor {
  /**
   * Normalize data for ML models
   */
  static normalizeData(data, method = 'minmax') {
    if (!Array.isArray(data) || data.length === 0) {
      return { normalized: [], scaler: null }
    }

    const numbers = data.filter((d) => typeof d === 'number' && !isNaN(d))
    if (numbers.length === 0) return { normalized: [], scaler: null }

    switch (method) {
      case 'minmax':
        const min = Math.min(...numbers)
        const max = Math.max(...numbers)
        const range = max - min

        if (range === 0) return { normalized: numbers, scaler: { min, max, range } }

        const normalized = numbers.map((x) => (x - min) / range)
        return {
          normalized,
          scaler: { min, max, range, method: 'minmax' },
        }

      case 'zscore':
        const mean = stats.mean(numbers)
        const stdDev = stats.standardDeviation(numbers)

        if (stdDev === 0) return { normalized: numbers, scaler: { mean, stdDev } }

        const zNormalized = numbers.map((x) => (x - mean) / stdDev)
        return {
          normalized: zNormalized,
          scaler: { mean, stdDev, method: 'zscore' },
        }

      default:
        return { normalized: numbers, scaler: null }
    }
  }

  /**
   * Denormalize data back to original scale
   */
  static denormalizeData(normalizedData, scaler) {
    if (!scaler || !Array.isArray(normalizedData)) return normalizedData

    switch (scaler.method) {
      case 'minmax':
        return normalizedData.map((x) => x * scaler.range + scaler.min)

      case 'zscore':
        return normalizedData.map((x) => x * scaler.stdDev + scaler.mean)

      default:
        return normalizedData
    }
  }

  /**
   * Prepare time series data for ML
   */
  static prepareTimeSeriesData(data, lookback = 7) {
    const X = []
    const y = []

    for (let i = lookback; i < data.length; i++) {
      X.push(data.slice(i - lookback, i))
      y.push(data[i])
    }

    return { X, y }
  }

  /**
   * Split data into train/test sets
   */
  static trainTestSplit(X, y, testSize = 0.2) {
    const totalSize = X.length
    const trainSize = Math.floor(totalSize * (1 - testSize))

    return {
      XTrain: X.slice(0, trainSize),
      XTest: X.slice(trainSize),
      yTrain: y.slice(0, trainSize),
      yTest: y.slice(trainSize),
    }
  }
}

/**
 * Statistical analysis utilities
 */
export class AIStatsAnalyzer {
  /**
   * Detect anomalies in data using statistical methods
   */
  static detectAnomalies(data, method = 'iqr', threshold = 1.5) {
    if (!Array.isArray(data) || data.length < 4) return []

    const numbers = data.filter((d) => typeof d === 'number' && !isNaN(d))
    if (numbers.length < 4) return []

    switch (method) {
      case 'iqr':
        const q1 = stats.quantile(numbers, 0.25)
        const q3 = stats.quantile(numbers, 0.75)
        const iqr = q3 - q1
        const lowerBound = q1 - threshold * iqr
        const upperBound = q3 + threshold * iqr

        return numbers.map((value, index) => ({
          index,
          value,
          isAnomaly: value < lowerBound || value > upperBound,
          reason:
            value < lowerBound
              ? 'below_lower_bound'
              : value > upperBound
                ? 'above_upper_bound'
                : 'normal',
        }))

      case 'zscore':
        const mean = stats.mean(numbers)
        const stdDev = stats.standardDeviation(numbers)

        return numbers.map((value, index) => {
          const zScore = Math.abs((value - mean) / stdDev)
          return {
            index,
            value,
            zScore,
            isAnomaly: zScore > threshold,
            reason: zScore > threshold ? 'high_zscore' : 'normal',
          }
        })

      default:
        return []
    }
  }

  /**
   * Analyze trends in time series data
   */
  static analyzeTrend(data, windowSize = 7) {
    if (!Array.isArray(data) || data.length < windowSize * 2) {
      return { trend: 'insufficient_data', strength: 0, direction: 'unknown' }
    }

    // Moving averages for trend analysis
    const movingAvg = []
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1)
      movingAvg.push(stats.mean(window))
    }

    // Linear regression on moving averages
    const xValues = movingAvg.map((_, index) => index)
    const regression = new SLR(xValues, movingAvg)

    const slope = regression.slope
    const rSquared = regression.coefficients.r2 || 0

    // Determine trend
    let trend = 'stable'
    let direction = 'flat'

    if (Math.abs(slope) > 0.1) {
      if (slope > 0) {
        trend = 'increasing'
        direction = 'up'
      } else {
        trend = 'decreasing'
        direction = 'down'
      }
    }

    return {
      trend,
      direction,
      strength: rSquared,
      slope,
      confidence: rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low',
    }
  }

  /**
   * Calculate correlation between two datasets
   */
  static calculateCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
      return { correlation: 0, strength: 'none', significance: 'low' }
    }

    try {
      const correlation = stats.sampleCorrelation(x, y)

      let strength = 'none'
      if (Math.abs(correlation) >= 0.8) strength = 'very_strong'
      else if (Math.abs(correlation) >= 0.6) strength = 'strong'
      else if (Math.abs(correlation) >= 0.4) strength = 'moderate'
      else if (Math.abs(correlation) >= 0.2) strength = 'weak'

      const significance = x.length >= 30 ? 'high' : x.length >= 10 ? 'medium' : 'low'

      return {
        correlation: correlation || 0,
        strength,
        significance,
        direction: correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'none',
      }
    } catch (error) {
      console.error('Error calculating correlation:', error)
      return { correlation: 0, strength: 'none', significance: 'low' }
    }
  }
}

/**
 * Pattern recognition utilities
 */
export class AIPatternRecognizer {
  /**
   * Identify patterns in business data
   */
  static identifyPatterns(data, patternType = 'seasonal') {
    if (!Array.isArray(data) || data.length < 12) {
      return { patterns: [], confidence: 0 }
    }

    const patterns = []

    switch (patternType) {
      case 'seasonal':
        // Weekly seasonality (assuming daily data)
        if (data.length >= 14) {
          const weeklyPattern = this.detectWeeklyPattern(data)
          if (weeklyPattern.strength > 0.3) {
            patterns.push({
              type: 'weekly_seasonal',
              strength: weeklyPattern.strength,
              description: `Dữ liệu có xu hướng ${weeklyPattern.peakDay} cao nhất, ${weeklyPattern.lowDay} thấp nhất`,
              actionable: `Tối ưu hóa resource allocation cho ${weeklyPattern.peakDay}`,
            })
          }
        }

        // Monthly seasonality
        if (data.length >= 60) {
          const monthlyPattern = this.detectMonthlyPattern(data)
          if (monthlyPattern.strength > 0.3) {
            patterns.push({
              type: 'monthly_seasonal',
              strength: monthlyPattern.strength,
              description: `Chu kỳ hàng tháng với peak vào ${monthlyPattern.peakPeriod}`,
              actionable: `Chuẩn bị resources cho peak period ${monthlyPattern.peakPeriod}`,
            })
          }
        }
        break

      case 'growth':
        const growthPattern = this.detectGrowthPattern(data)
        if (growthPattern.isSignificant) {
          patterns.push({
            type: 'growth_pattern',
            strength: growthPattern.confidence,
            description: `${growthPattern.type} growth với rate ${growthPattern.rate.toFixed(2)}%`,
            actionable: `${growthPattern.type === 'exponential' ? 'Chuẩn bị scale infrastructure' : 'Maintain current growth strategy'}`,
          })
        }
        break
    }

    return {
      patterns,
      confidence: patterns.length > 0 ? stats.mean(patterns.map((p) => p.strength)) : 0,
    }
  }

  static detectWeeklyPattern(data) {
    // Assume data is daily, group by day of week
    const dayGroups = Array(7)
      .fill()
      .map(() => [])

    data.forEach((value, index) => {
      const dayOfWeek = index % 7
      dayGroups[dayOfWeek].push(value)
    })

    const dayAverages = dayGroups.map((group) => (group.length > 0 ? stats.mean(group) : 0))

    const maxDay = dayAverages.indexOf(Math.max(...dayAverages))
    const minDay = dayAverages.indexOf(Math.min(...dayAverages))

    const strength = stats.standardDeviation(dayAverages) / stats.mean(dayAverages)

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return {
      strength: isNaN(strength) ? 0 : strength,
      peakDay: dayNames[maxDay],
      lowDay: dayNames[minDay],
      dayAverages,
    }
  }

  static detectMonthlyPattern(data) {
    // Simple monthly pattern detection
    const chunkSize = Math.floor(data.length / 4) // Quarterly
    const quarters = []

    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize
      const end = (i + 1) * chunkSize
      const chunk = data.slice(start, end)
      quarters.push(stats.mean(chunk))
    }

    const maxQuarter = quarters.indexOf(Math.max(...quarters))
    const strength = stats.standardDeviation(quarters) / stats.mean(quarters)

    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']

    return {
      strength: isNaN(strength) ? 0 : strength,
      peakPeriod: quarterNames[maxQuarter],
      quarterlyAverages: quarters,
    }
  }

  static detectGrowthPattern(data) {
    if (data.length < 10) return { isSignificant: false }

    const xValues = data.map((_, index) => index)

    // Try linear regression
    const linearReg = new SLR(xValues, data)
    const linearR2 = linearReg.coefficients?.r2 || 0

    // Try exponential pattern (log transform)
    const positiveData = data.filter((x) => x > 0)
    if (positiveData.length < data.length * 0.8) {
      return { isSignificant: false }
    }

    const logData = positiveData.map((x) => Math.log(x))
    const expReg = new SLR(xValues.slice(0, logData.length), logData)
    const expR2 = expReg.coefficients?.r2 || 0

    const isLinearBetter = linearR2 > expR2
    const bestR2 = Math.max(linearR2, expR2)

    if (bestR2 < 0.5) return { isSignificant: false }

    const slope = isLinearBetter ? linearReg.slope : expReg.slope
    const growthRate = isLinearBetter
      ? (slope / stats.mean(data)) * 100
      : (Math.exp(slope) - 1) * 100

    return {
      isSignificant: true,
      type: isLinearBetter ? 'linear' : 'exponential',
      confidence: bestR2,
      rate: growthRate,
      slope,
    }
  }
}

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  tensorflow: {
    backend: 'webgl', // or 'cpu' for compatibility
    debug: process.env.NODE_ENV === 'development',
  },
  models: {
    predictionLookback: 7,
    confidenceThreshold: 0.7,
    minDataPoints: 10,
  },
  insights: {
    maxInsights: 5,
    minConfidence: 0.6,
    refreshInterval: 300000, // 5 minutes
  },
}

export default {
  AIDataProcessor,
  AIStatsAnalyzer,
  AIPatternRecognizer,
  AI_CONFIG,
}
