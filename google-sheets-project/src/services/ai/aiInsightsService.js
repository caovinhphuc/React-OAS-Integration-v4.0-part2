/**
 * AI Insights Service - Intelligent Data Analysis
 * MIA.vn Google Integration Platform
 */

// Browser-compatible imports
import * as stats from 'simple-statistics'
import { analyzeDataEfficiency } from '../../utils/aiEfficiency'
import { AIPatternRecognizer, AIStatsAnalyzer } from '../../utils/aiUtils'

// Browser-compatible NLP fallbacks
const createBrowserNLP = () => {
  return {
    // Simple sentiment analysis fallback
    sentiment: (text) => {
      const positiveWords = [
        'good',
        'great',
        'excellent',
        'amazing',
        'wonderful',
        'fantastic',
        'tốt',
        'tuyệt',
        'xuất sắc',
      ]
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'xấu', 'tệ', 'dở']

      const words = text.toLowerCase().split(' ')
      let score = 0

      words.forEach((word) => {
        if (positiveWords.includes(word)) score += 1
        if (negativeWords.includes(word)) score -= 1
      })

      return {
        score,
        comparative: score / words.length,
        positive: positiveWords.filter((word) => words.includes(word)),
        negative: negativeWords.filter((word) => words.includes(word)),
      }
    },

    // Simple tokenizer fallback
    tokenize: (text) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter((word) => word.length > 0)
    },

    // Simple stemmer fallback
    stem: (word) => {
      // Basic Vietnamese and English stemming
      const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness']
      let stemmed = word.toLowerCase()

      for (let suffix of suffixes) {
        if (stemmed.endsWith(suffix)) {
          stemmed = stemmed.slice(0, -suffix.length)
          break
        }
      }

      return stemmed
    },
  }
}

// Initialize browser-compatible NLP
const nlp = createBrowserNLP()

/**
 * Intelligent Insights Generator
 */
export class AIInsightsEngine {
  constructor() {
    this.insightGenerators = new Map()
    this.confidenceThreshold = 0.6
    this.maxInsights = 5
    this.initializeGenerators()
  }

  /**
   * Initialize insight generators
   */
  initializeGenerators() {
    // Trend analysis generator
    this.insightGenerators.set('trend', {
      analyze: (data, context) => this.generateTrendInsights(data, context),
      priority: 1,
    })

    // Anomaly detection generator
    this.insightGenerators.set('anomaly', {
      analyze: (data, context) => this.generateAnomalyInsights(data, context),
      priority: 2,
    })

    // Performance optimization generator
    this.insightGenerators.set('performance', {
      analyze: (data, context) => this.generatePerformanceInsights(data, context),
      priority: 3,
    })

    // Pattern recognition generator
    this.insightGenerators.set('pattern', {
      analyze: (data, context) => this.generatePatternInsights(data, context),
      priority: 4,
    })

    // Correlation analysis generator
    this.insightGenerators.set('correlation', {
      analyze: (data, context) => this.generateCorrelationInsights(data, context),
      priority: 5,
    })
  }

  /**
   * Generate AI insights from data
   */
  async generateInsights(dataContext) {
    const { sheets = [], files = [], alerts = [], timeframe = '7d' } = dataContext

    try {
      const insights = []
      const timestamp = new Date()

      // Prepare data for analysis
      const analysisContext = {
        sheets: this.prepareSheetData(sheets),
        files: this.prepareFileData(files),
        alerts: this.prepareAlertData(alerts),
        timeframe,
        timestamp,
      }

      // Generate insights from each generator
      for (const [type, generator] of this.insightGenerators) {
        try {
          const generatedInsights = await generator.analyze(analysisContext.sheets, analysisContext)

          if (Array.isArray(generatedInsights)) {
            insights.push(
              ...generatedInsights.filter(
                (insight) => insight.confidence >= this.confidenceThreshold,
              ),
            )
          }
        } catch (error) {
          console.error(`Insight generator ${type} failed:`, error)
        }
      }

      // Sort by confidence and priority
      const sortedInsights = insights
        .sort((a, b) => {
          if (a.confidence !== b.confidence) {
            return b.confidence - a.confidence
          }
          return a.priority - b.priority
        })
        .slice(0, this.maxInsights)

      return {
        insights: sortedInsights,
        metadata: {
          totalGenerated: insights.length,
          totalReturned: sortedInsights.length,
          generatedAt: timestamp,
          dataContext: {
            sheets: sheets.length,
            files: files.length,
            alerts: alerts.length,
            timeframe,
          },
        },
      }
    } catch (error) {
      console.error('AI insights generation failed:', error)
      return {
        insights: [],
        error: error.message,
        metadata: { generatedAt: new Date() },
      }
    }
  }

  /**
   * Generate trend insights
   */
  generateTrendInsights(data, context) {
    if (!Array.isArray(data) || data.length < 7) return []

    const insights = []

    try {
      // Analyze data volume trend
      const volumeTrend = AIStatsAnalyzer.analyzeTrend(data.map((d) => d.count || 1))

      if (volumeTrend.confidence === 'high' && volumeTrend.strength > 0.6) {
        const changePercent = (
          ((volumeTrend.slope * 7) / stats.mean(data.map((d) => d.count || 1))) *
          100
        ).toFixed(1)

        insights.push({
          id: `trend_${Date.now()}`,
          type: 'trend',
          category: 'growth',
          title: `📈 ${volumeTrend.trend === 'increasing' ? 'Tăng trưởng' : 'Giảm'} xu hướng phát hiện`,
          description: `Dữ liệu ${volumeTrend.trend === 'increasing' ? 'tăng' : 'giảm'} ${Math.abs(changePercent)}% trong ${context.timeframe}`,
          confidence: volumeTrend.strength,
          impact:
            Math.abs(changePercent) > 20 ? 'high' : Math.abs(changePercent) > 10 ? 'medium' : 'low',
          action:
            volumeTrend.trend === 'increasing'
              ? 'Chuẩn bị resources để handle increased load'
              : 'Điều tra nguyên nhân decline và optimization',
          priority: 1,
          metadata: {
            slope: volumeTrend.slope,
            direction: volumeTrend.direction,
            changePercent: parseFloat(changePercent),
          },
        })
      }

      // Analyze activity patterns
      if (data.length >= 14) {
        const activityPattern = this.analyzeActivityPattern(data)
        if (activityPattern.confidence > 0.7) {
          insights.push({
            id: `activity_${Date.now()}`,
            type: 'trend',
            category: 'usage_pattern',
            title: '⏰ Pattern hoạt động phát hiện',
            description: activityPattern.description,
            confidence: activityPattern.confidence,
            impact: 'medium',
            action: activityPattern.recommendation,
            priority: 2,
            metadata: activityPattern.metadata,
          })
        }
      }
    } catch (error) {
      console.error('Trend insights generation failed:', error)
    }

    return insights
  }

  /**
   * Generate anomaly insights
   */
  generateAnomalyInsights(data, context) {
    if (!Array.isArray(data) || data.length < 10) return []

    const insights = []

    try {
      const values = data.map((d) => d.count || 1)
      const anomalies = AIStatsAnalyzer.detectAnomalies(values, 'iqr', 1.5)

      const significantAnomalies = anomalies.filter((a) => a.isAnomaly)

      if (significantAnomalies.length > 0) {
        const recentAnomalies = significantAnomalies.slice(-3) // Last 3 anomalies
        const avgValue = stats.mean(values)

        recentAnomalies.forEach((anomaly, index) => {
          const deviation = (((anomaly.value - avgValue) / avgValue) * 100).toFixed(1)

          insights.push({
            id: `anomaly_${Date.now()}_${index}`,
            type: 'anomaly',
            category: 'data_quality',
            title: '⚠️ Bất thường dữ liệu phát hiện',
            description: `Giá trị ${anomaly.value} ${deviation > 0 ? 'cao hơn' : 'thấp hơn'} ${Math.abs(deviation)}% so với bình thường`,
            confidence: 0.85,
            impact:
              Math.abs(deviation) > 100 ? 'high' : Math.abs(deviation) > 50 ? 'medium' : 'low',
            action:
              Math.abs(deviation) > 100
                ? 'Kiểm tra ngay và xác minh dữ liệu'
                : 'Monitor và log cho investigation',
            priority: Math.abs(deviation) > 100 ? 1 : 3,
            metadata: {
              actualValue: anomaly.value,
              expectedRange: [avgValue * 0.8, avgValue * 1.2],
              deviation: parseFloat(deviation),
              reason: anomaly.reason,
            },
          })
        })
      }
    } catch (error) {
      console.error('Anomaly insights generation failed:', error)
    }

    return insights
  }

  /**
   * Generate performance insights
   */
  generatePerformanceInsights(data, context) {
    const insights = []

    try {
      // Analyze response times if available
      if (data.some((d) => d.responseTime)) {
        const responseTimes = data
          .map((d) => d.responseTime)
          .filter((rt) => typeof rt === 'number' && rt > 0)

        if (responseTimes.length > 5) {
          const avgResponseTime = stats.mean(responseTimes)
          const p95ResponseTime = stats.quantile(responseTimes, 0.95)

          if (avgResponseTime > 2000) {
            // > 2 seconds
            insights.push({
              id: `performance_${Date.now()}`,
              type: 'optimization',
              category: 'performance',
              title: '⚡ Cơ hội tối ưu hiệu suất',
              description: `Response time trung bình ${avgResponseTime.toFixed(0)}ms có thể được cải thiện`,
              confidence: 0.8,
              impact: 'high',
              action: 'Implement caching và optimize API calls',
              priority: 2,
              metadata: {
                avgResponseTime,
                p95ResponseTime,
                improvementPotential: Math.max(0, avgResponseTime - 1000),
              },
            })
          }
        }
      }

      // Analyze data efficiency
      const dataEfficiency = analyzeDataEfficiency(data, context)
      if (dataEfficiency.insights.length > 0) {
        insights.push(...dataEfficiency.insights)
      }
    } catch (error) {
      console.error('Performance insights generation failed:', error)
    }

    return insights
  }

  /**
   * Generate pattern insights
   */
  generatePatternInsights(data, context) {
    if (!Array.isArray(data) || data.length < 14) return []

    const insights = []

    try {
      // Weekly patterns
      const weeklyPatterns = AIPatternRecognizer.identifyPatterns(
        data.map((d) => d.count || 1),
        'seasonal',
      )

      if (weeklyPatterns.confidence > 0.4) {
        weeklyPatterns.patterns.forEach((pattern) => {
          insights.push({
            id: `pattern_${Date.now()}_${pattern.type}`,
            type: 'pattern',
            category: 'optimization',
            title: '📊 Pattern thời gian phát hiện',
            description: pattern.description,
            confidence: pattern.strength,
            impact: 'medium',
            action: pattern.actionable,
            priority: 3,
            metadata: {
              patternType: pattern.type,
              strength: pattern.strength,
            },
          })
        })
      }

      // Growth patterns
      const growthPatterns = AIPatternRecognizer.identifyPatterns(
        data.map((d) => d.count || 1),
        'growth',
      )

      if (growthPatterns.confidence > 0.6) {
        growthPatterns.patterns.forEach((pattern) => {
          insights.push({
            id: `growth_${Date.now()}_${pattern.type}`,
            type: 'pattern',
            category: 'business',
            title: '📈 Growth pattern analysis',
            description: pattern.description,
            confidence: pattern.strength,
            impact: 'high',
            action: pattern.actionable,
            priority: 1,
            metadata: {
              patternType: pattern.type,
              strength: pattern.strength,
            },
          })
        })
      }
    } catch (error) {
      console.error('Pattern insights generation failed:', error)
    }

    return insights
  }

  /**
   * Generate correlation insights
   */
  generateCorrelationInsights(data, context) {
    const insights = []

    try {
      const { sheets = [], files = [], alerts = [] } = context

      // Analyze correlation between different data sources
      if (sheets.length > 0 && files.length > 0) {
        const sheetCounts = sheets.map((s) => s.count || 1)
        const fileCounts = files.map((f) => f.count || 1)

        const minLength = Math.min(sheetCounts.length, fileCounts.length)
        if (minLength > 5) {
          const correlation = AIStatsAnalyzer.calculateCorrelation(
            sheetCounts.slice(-minLength),
            fileCounts.slice(-minLength),
          )

          if (correlation.strength !== 'none' && correlation.significance !== 'low') {
            insights.push({
              id: `correlation_${Date.now()}`,
              type: 'correlation',
              category: 'analysis',
              title: '🔗 Mối quan hệ dữ liệu phát hiện',
              description: `${correlation.strength} correlation (${(correlation.correlation * 100).toFixed(0)}%) giữa Google Sheets và Drive activity`,
              confidence: Math.abs(correlation.correlation),
              impact: 'medium',
              action:
                correlation.direction === 'positive'
                  ? 'Tận dụng synergy giữa Sheets và Drive workflows'
                  : 'Investigate inverse relationship pattern',
              priority: 4,
              metadata: {
                correlation: correlation.correlation,
                strength: correlation.strength,
                direction: correlation.direction,
              },
            })
          }
        }
      }
    } catch (error) {
      console.error('Correlation insights generation failed:', error)
    }

    return insights
  }

  /**
   * Helper: Prepare sheet data for analysis
   */
  prepareSheetData(sheets) {
    if (!Array.isArray(sheets)) return []

    return sheets.map((sheet, index) => ({
      index,
      count: typeof sheet === 'number' ? sheet : sheet.rowCount || sheet.length || 1,
      responseTime: sheet.responseTime || null,
      lastModified: sheet.lastModified || null,
      size: sheet.columnCount || null,
    }))
  }

  /**
   * Helper: Prepare file data for analysis
   */
  prepareFileData(files) {
    if (!Array.isArray(files)) return []

    return files.map((file, index) => ({
      index,
      count: typeof file === 'number' ? file : 1,
      size: file.size || null,
      type: file.mimeType || file.type || null,
      responseTime: file.responseTime || null,
    }))
  }

  /**
   * Helper: Prepare alert data for analysis
   */
  prepareAlertData(alerts) {
    if (!Array.isArray(alerts)) return []

    return alerts.map((alert, index) => ({
      index,
      count: typeof alert === 'number' ? alert : 1,
      severity: alert.severity || 'info',
      type: alert.type || 'general',
    }))
  }

  /**
   * Analyze activity patterns (helper)
   */
  analyzeActivityPattern(data) {
    try {
      if (data.length < 7) return { confidence: 0 }

      // Group by hour if timestamp available, or by index
      const hourlyActivity = new Array(24).fill(0)
      const hourCounts = new Array(24).fill(0)

      data.forEach((item, index) => {
        let hour = 9 // Default business hour
        if (item.timestamp) {
          hour = new Date(item.timestamp).getHours()
        } else {
          // Assume data is daily, simulate hourly pattern
          hour = index % 24
        }

        hourlyActivity[hour] += item.count || 1
        hourCounts[hour]++
      })

      // Calculate average activity by hour
      const avgHourlyActivity = hourlyActivity.map((total, hour) =>
        hourCounts[hour] > 0 ? total / hourCounts[hour] : 0,
      )

      // Find peak hours
      const maxActivity = Math.max(...avgHourlyActivity)
      const peakHours = avgHourlyActivity
        .map((activity, hour) => ({ hour, activity }))
        .filter((h) => h.activity > maxActivity * 0.8)
        .map((h) => h.hour)

      if (peakHours.length === 0) return { confidence: 0 }

      // Calculate confidence based on pattern strength
      const activityVariance = stats.variance(avgHourlyActivity.filter((a) => a > 0))
      const activityMean = stats.mean(avgHourlyActivity.filter((a) => a > 0))
      const confidence = activityVariance / (activityMean * activityMean) // Coefficient of variation

      const peakHourRanges = this.groupConsecutiveHours(peakHours)

      return {
        confidence: Math.min(0.9, confidence),
        description: `Peak activity từ ${peakHourRanges[0].start}:00 đến ${peakHourRanges[0].end}:00`,
        recommendation: `Optimize resources cho peak hours ${peakHourRanges[0].start}-${peakHourRanges[0].end}`,
        metadata: {
          peakHours,
          peakHourRanges,
          avgHourlyActivity: avgHourlyActivity.map((a, i) => ({ hour: i, activity: a })),
        },
      }
    } catch (error) {
      console.error('Activity pattern analysis failed:', error)
      return { confidence: 0 }
    }
  }

  /**
   * Group consecutive hours (helper)
   */
  groupConsecutiveHours(hours) {
    if (hours.length === 0) return []

    hours.sort((a, b) => a - b)
    const groups = []
    let currentGroup = { start: hours[0], end: hours[0] }

    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === currentGroup.end + 1) {
        currentGroup.end = hours[i]
      } else {
        groups.push(currentGroup)
        currentGroup = { start: hours[i], end: hours[i] }
      }
    }
    groups.push(currentGroup)

    return groups
  }
}

/**
 * Natural Language Insights Generator
 */
export class NLPInsightsGenerator {
  constructor() {
    // Use browser-compatible NLP functions
    this.tokenizer = nlp
    this.stemmer = nlp
  }

  /**
   * Generate insights from text data
   */
  async analyzeTextData(textData) {
    if (!Array.isArray(textData) || textData.length === 0) {
      return { insights: [], confidence: 0 }
    }

    try {
      const insights = []

      // Sentiment analysis
      const sentimentAnalysis = await this.analyzeSentiment(textData)
      if (sentimentAnalysis.confidence > 0.6) {
        insights.push(sentimentAnalysis.insight)
      }

      // Keyword extraction
      const keywordAnalysis = this.extractKeywords(textData)
      if (keywordAnalysis.confidence > 0.5) {
        insights.push(keywordAnalysis.insight)
      }

      return {
        insights,
        confidence: insights.length > 0 ? stats.mean(insights.map((i) => i.confidence)) : 0,
      }
    } catch (error) {
      console.error('NLP insights generation failed:', error)
      return { insights: [], confidence: 0 }
    }
  }

  /**
   * Analyze sentiment of text data
   */
  async analyzeSentiment(textData) {
    try {
      const sentiments = textData
        .filter((text) => typeof text === 'string' && text.length > 0)
        .map((text) => {
          const result = nlp.sentiment(text)
          return {
            score: result.score,
            comparative: result.comparative,
            positive: result.positive,
            negative: result.negative,
          }
        })

      if (sentiments.length === 0) {
        return { confidence: 0 }
      }

      const avgScore = stats.mean(sentiments.map((s) => s.score))
      const avgComparative = stats.mean(sentiments.map((s) => s.comparative))

      let overallSentiment = 'neutral'
      if (avgComparative > 0.1) overallSentiment = 'positive'
      else if (avgComparative < -0.1) overallSentiment = 'negative'

      return {
        confidence: Math.min(0.8, Math.abs(avgComparative) * 2),
        insight: {
          id: `sentiment_${Date.now()}`,
          type: 'sentiment',
          category: 'content_analysis',
          title: `😊 Sentiment Analysis: ${overallSentiment}`,
          description: `Overall sentiment is ${overallSentiment} với score ${avgScore.toFixed(1)}`,
          confidence: Math.min(0.8, Math.abs(avgComparative) * 2),
          impact: 'medium',
          action:
            overallSentiment === 'negative'
              ? 'Review content quality và user feedback'
              : 'Maintain positive content strategy',
          priority: 4,
          metadata: {
            avgScore,
            avgComparative,
            overallSentiment,
            totalTexts: sentiments.length,
          },
        },
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error)
      return { confidence: 0 }
    }
  }

  /**
   * Extract keywords and topics
   */
  extractKeywords(textData) {
    try {
      const allText = textData
        .filter((text) => typeof text === 'string')
        .join(' ')
        .toLowerCase()

      if (allText.length < 50) {
        return { confidence: 0 }
      }

      // Tokenize and stem
      const tokens = this.tokenizer.tokenize(allText)
      const stemmed = tokens.map((token) => this.stemmer.stem(token))

      // Count frequency
      const frequency = {}
      stemmed.forEach((word) => {
        if (word.length > 3 && !/^[0-9]+$/.test(word)) {
          frequency[word] = (frequency[word] || 0) + 1
        }
      })

      // Get top keywords
      const topKeywords = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }))

      if (topKeywords.length === 0) {
        return { confidence: 0 }
      }

      const topWord = topKeywords[0]
      const totalWords = stemmed.length
      const keywordDensity = topWord.count / totalWords

      return {
        confidence: Math.min(0.8, keywordDensity * 10),
        insight: {
          id: `keywords_${Date.now()}`,
          type: 'keywords',
          category: 'content_analysis',
          title: '🔤 Key Topics Identified',
          description: `Top keyword: "${topWord.word}" appears ${topWord.count} times (${(keywordDensity * 100).toFixed(1)}%)`,
          confidence: Math.min(0.8, keywordDensity * 10),
          impact: 'low',
          action: 'Use keyword insights for content optimization',
          priority: 5,
          metadata: {
            topKeywords,
            keywordDensity,
            totalWords,
          },
        },
      }
    } catch (error) {
      console.error('Keyword extraction failed:', error)
      return { confidence: 0 }
    }
  }
}

export default {
  AIInsightsEngine,
  NLPInsightsGenerator,
}
