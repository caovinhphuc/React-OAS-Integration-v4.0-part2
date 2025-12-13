/**
 * Real-time Data Processing Service
 * Stream processing and batch analytics for AI/ML
 */

class RealTimeProcessor {
  constructor() {
    this.dataStreams = new Map();
    this.batchProcessors = new Map();
    this.isProcessing = false;
    this.processingInterval = null;
  }

  /**
   * Initialize data stream
   */
  initializeDataStream(streamId, config) {
    try {
      console.log(`📊 Initializing data stream: ${streamId}`);

      const stream = {
        id: streamId,
        buffer: [],
        bufferSize: config.bufferSize || 1000,
        analytics: config.analytics || ['mean', 'trend'],
        isActive: true,
        totalProcessed: 0,
        lastProcessed: null,
        createdAt: new Date().toISOString(),
      };

      this.dataStreams.set(streamId, stream);

      // Initialize batch processor for this stream
      this.batchProcessors.set(streamId, {
        batchSize: 100,
        processingInterval: 5000, // 5 seconds
        lastProcessed: null,
        totalBatches: 0,
      });

      console.log(`✅ Data stream ${streamId} initialized`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize stream ${streamId}:`, error);
      return false;
    }
  }

  /**
   * Add data point to stream
   */
  addDataPoint(streamId, dataPoint) {
    try {
      if (!this.dataStreams.has(streamId)) {
        console.warn(`Stream ${streamId} not found`);
        return false;
      }

      const stream = this.dataStreams.get(streamId);

      // Add timestamp if not provided
      if (!dataPoint.timestamp) {
        dataPoint.timestamp = Date.now();
      }

      // Add to buffer
      stream.buffer.push(dataPoint);
      stream.totalProcessed++;
      stream.lastProcessed = dataPoint.timestamp;

      // Maintain buffer size
      if (stream.buffer.length > stream.bufferSize) {
        stream.buffer = stream.buffer.slice(-stream.bufferSize);
      }

      // Process in real-time if configured
      if (stream.analytics.includes('realtime')) {
        this.processRealtimeAnalytics(streamId, dataPoint);
      }

      return true;
    } catch (error) {
      console.error(`Failed to add data point to ${streamId}:`, error);
      return false;
    }
  }

  /**
   * Start batch processing
   */
  startBatchProcessing() {
    if (this.isProcessing) {
      console.warn('Batch processing already running');
      return;
    }

    this.isProcessing = true;
    console.log('🔄 Starting batch processing...');

    this.processingInterval = setInterval(() => {
      this.processAllBatches();
    }, 2000); // Process every 2 seconds

    console.log('✅ Batch processing started');
  }

  /**
   * Stop batch processing
   */
  stopBatchProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log('⏹️ Batch processing stopped');
  }

  /**
   * Process all batches
   */
  processAllBatches() {
    for (const [streamId, processor] of this.batchProcessors) {
      this.processBatch(streamId);
    }
  }

  /**
   * Process batch for specific stream
   */
  processBatch(streamId) {
    try {
      if (!this.dataStreams.has(streamId)) {
        return null;
      }

      const stream = this.dataStreams.get(streamId);
      const processor = this.batchProcessors.get(streamId);

      if (stream.buffer.length === 0) {
        return null;
      }

      // Get batch data
      const batchSize = Math.min(processor.batchSize, stream.buffer.length);
      const batchData = stream.buffer.slice(-batchSize);

      // Process analytics
      const analytics = this.calculateStreamAnalytics(streamId, batchData);

      // Update processor stats
      processor.lastProcessed = Date.now();
      processor.totalBatches++;

      return {
        streamId,
        batchSize: batchData.length,
        analytics,
        timestamp: Date.now(),
        totalBatches: processor.totalBatches,
      };
    } catch (error) {
      console.error(`Batch processing failed for ${streamId}:`, error);
      return null;
    }
  }

  /**
   * Calculate stream analytics
   */
  calculateStreamAnalytics(streamId, data) {
    try {
      const stream = this.dataStreams.get(streamId);
      const analytics = {};

      if (data.length === 0) {
        return analytics;
      }

      // Extract values for analysis
      const values = data.map((d) => d.value || d).filter((v) => typeof v === 'number');

      if (values.length === 0) {
        return analytics;
      }

      // Basic statistics
      if (stream.analytics.includes('mean')) {
        analytics.mean = this.calculateMean(values);
      }

      if (stream.analytics.includes('trend')) {
        analytics.trend = this.calculateTrend(values);
      }

      if (stream.analytics.includes('anomaly')) {
        analytics.anomalies = this.detectAnomalies(values);
      }

      if (stream.analytics.includes('volatility')) {
        analytics.volatility = this.calculateVolatility(values);
      }

      if (stream.analytics.includes('optimization')) {
        analytics.optimization = this.calculateOptimization(values);
      }

      if (stream.analytics.includes('prediction')) {
        analytics.prediction = this.generatePrediction(values);
      }

      if (stream.analytics.includes('seasonal')) {
        analytics.seasonal = this.analyzeSeasonality(values);
      }

      if (stream.analytics.includes('forecast')) {
        analytics.forecast = this.generateForecast(values);
      }

      return analytics;
    } catch (error) {
      console.error(`Analytics calculation failed for ${streamId}:`, error);
      return {};
    }
  }

  /**
   * Process real-time analytics
   */
  processRealtimeAnalytics(streamId, dataPoint) {
    try {
      const stream = this.dataStreams.get(streamId);

      // Real-time anomaly detection
      if (stream.analytics.includes('anomaly')) {
        const isAnomaly = this.detectRealtimeAnomaly(streamId, dataPoint);
        if (isAnomaly) {
          console.warn(`🚨 Anomaly detected in stream ${streamId}:`, dataPoint);
        }
      }

      // Real-time trend analysis
      if (stream.analytics.includes('trend')) {
        const trendChange = this.detectTrendChange(streamId, dataPoint);
        if (trendChange) {
          console.log(`📈 Trend change detected in stream ${streamId}:`, trendChange);
        }
      }
    } catch (error) {
      console.error(`Real-time analytics failed for ${streamId}:`, error);
    }
  }

  /**
   * Get all stream status
   */
  getAllStreamStatus() {
    const status = {};

    for (const [streamId, stream] of this.dataStreams) {
      status[streamId] = {
        isActive: stream.isActive,
        bufferSize: stream.buffer.length,
        totalProcessed: stream.totalProcessed,
        lastProcessed: stream.lastProcessed,
        analytics: stream.analytics,
        createdAt: stream.createdAt,
      };
    }

    return status;
  }

  /**
   * Calculate mean
   */
  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate trend
   */
  calculateTrend(values) {
    if (values.length < 2) {
      return { direction: 'unknown', strength: 0 };
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstMean = this.calculateMean(firstHalf);
    const secondMean = this.calculateMean(secondHalf);

    const change = (secondMean - firstMean) / firstMean;
    const direction = change > 0.05 ? 'increasing' : change < -0.05 ? 'decreasing' : 'stable';

    return {
      direction,
      strength: Math.abs(change),
      change: change * 100,
    };
  }

  /**
   * Detect anomalies
   */
  detectAnomalies(values) {
    if (values.length < 3) {
      return [];
    }

    const mean = this.calculateMean(values);
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    const threshold = 2 * stdDev;

    return values
      .map((val, index) => ({ value: val, index, deviation: Math.abs(val - mean) }))
      .filter((item) => item.deviation > threshold)
      .map((item) => ({
        index: item.index,
        value: item.value,
        severity: Math.min(1, item.deviation / (3 * stdDev)),
      }));
  }

  /**
   * Calculate volatility
   */
  calculateVolatility(values) {
    if (values.length < 2) {
      return 0;
    }

    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Calculate optimization potential
   */
  calculateOptimization(values) {
    const mean = this.calculateMean(values);
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      potential: (max - mean) / max,
      efficiency: mean / max,
      range: max - min,
      recommendation: mean < max * 0.8 ? 'optimization_opportunity' : 'efficient',
    };
  }

  /**
   * Generate prediction
   */
  generatePrediction(values) {
    if (values.length < 3) {
      return null;
    }

    // Simple linear prediction
    const trend = this.calculateTrend(values);
    const lastValue = values[values.length - 1];

    return {
      nextValue: lastValue * (1 + trend.change / 100),
      confidence: Math.max(0.3, Math.min(0.9, 1 - Math.abs(trend.change) / 100)),
      trend: trend.direction,
    };
  }

  /**
   * Analyze seasonality
   */
  analyzeSeasonality(values) {
    if (values.length < 12) {
      return null;
    }

    const period = 12; // Monthly seasonality
    const seasonalComponents = [];

    for (let i = 0; i < period; i++) {
      const seasonalValues = [];
      for (let j = i; j < values.length; j += period) {
        seasonalValues.push(values[j]);
      }
      if (seasonalValues.length > 0) {
        seasonalComponents.push(this.calculateMean(seasonalValues));
      }
    }

    const seasonalStrength =
      seasonalComponents.length > 0 ? Math.min(1, this.calculateVolatility(seasonalComponents)) : 0;

    return {
      strength: seasonalStrength,
      period,
      components: seasonalComponents,
      significance: seasonalStrength > 0.3 ? 'high' : seasonalStrength > 0.1 ? 'medium' : 'low',
    };
  }

  /**
   * Generate forecast
   */
  generateForecast(values) {
    const prediction = this.generatePrediction(values);
    if (!prediction) {
      return null;
    }

    const forecast = [];
    let currentValue = values[values.length - 1];

    for (let i = 0; i < 7; i++) {
      // 7-day forecast
      currentValue = currentValue * (1 + prediction.trend === 'increasing' ? 0.01 : -0.01);
      forecast.push(currentValue);
    }

    return {
      forecast,
      confidence: prediction.confidence,
      trend: prediction.trend,
    };
  }

  /**
   * Detect real-time anomaly
   */
  detectRealtimeAnomaly(streamId, dataPoint) {
    const stream = this.dataStreams.get(streamId);
    if (stream.buffer.length < 5) {
      return false;
    }

    const recentValues = stream.buffer.slice(-5).map((d) => d.value || d);
    const mean = this.calculateMean(recentValues);
    const stdDev = Math.sqrt(
      recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length
    );

    const currentValue = dataPoint.value || dataPoint;
    const deviation = Math.abs(currentValue - mean);

    return deviation > 2 * stdDev;
  }

  /**
   * Detect trend change
   */
  detectTrendChange(streamId, dataPoint) {
    const stream = this.dataStreams.get(streamId);
    if (stream.buffer.length < 10) {
      return null;
    }

    const recentValues = stream.buffer.slice(-10).map((d) => d.value || d);
    const currentValue = dataPoint.value || dataPoint;

    const oldTrend = this.calculateTrend(recentValues.slice(0, 5));
    const newTrend = this.calculateTrend([...recentValues.slice(5), currentValue]);

    if (oldTrend.direction !== newTrend.direction) {
      return {
        oldDirection: oldTrend.direction,
        newDirection: newTrend.direction,
        strength: newTrend.strength,
      };
    }

    return null;
  }

  /**
   * Calculate real-time metrics
   */
  calculateRealTimeMetrics(streamStatus) {
    const totalStreams = Object.keys(streamStatus).length;
    const activeStreams = Object.values(streamStatus).filter((s) => s.isActive).length;
    const totalProcessed = Object.values(streamStatus).reduce(
      (sum, s) => sum + s.totalProcessed,
      0
    );

    return {
      totalStreams,
      activeStreams,
      totalProcessed,
      processingRate: totalProcessed / Math.max(1, totalStreams),
      health: activeStreams / totalStreams,
    };
  }

  /**
   * Clear all streams
   */
  clearAllStreams() {
    this.dataStreams.clear();
    this.batchProcessors.clear();
    console.log('🧹 All streams cleared');
  }
}

// Export singleton instance
export default new RealTimeProcessor();
