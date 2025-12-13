/**
 * Prediction Orchestrator
 * Hợp nhất các service dự báo: Regression, LSTM TimeSeries, NeuralNet, Ensemble AdvancedML.
 * Mục tiêu: chọn chiến lược phù hợp dựa trên độ dài chuỗi, seasonality, yêu cầu latency.
 *
 * Usage (async):
 *   import orchestrator from './predictionOrchestrator'
 *   const result = await orchestrator.predict(series, { horizon: 7 })
 */
import * as stats from 'simple-statistics'
import advancedMLService from './advancedMLService'
import {
  NeuralNetworkPredictionService,
  RegressionPredictionService,
  TimeSeriesPredictionService,
} from './aiPredictiveService'

const timeSeriesService = new TimeSeriesPredictionService()
const nnService = new NeuralNetworkPredictionService()

// Simple cache to avoid retraining too often
const modelCache = {
  lstmTrained: false,
  nnTrained: false,
}

function detectSeasonality(data) {
  if (!Array.isArray(data) || data.length < 12) return false
  // naive autocorrelation check lag 7 & 12
  const mean = stats.mean(data)
  const lag = 7
  let num = 0
  let denomA = 0
  let denomB = 0
  for (let i = 0; i < data.length - lag; i++) {
    const a = data[i] - mean
    const b = data[i + lag] - mean
    num += a * b
    denomA += a * a
    denomB += b * b
  }
  const corr = num / Math.sqrt((denomA || 1) * (denomB || 1))
  return corr > 0.6
}

function basicQualityCheck(series) {
  if (!Array.isArray(series) || series.length < 3) {
    return { ok: false, reason: 'INSUFFICIENT_DATA' }
  }
  if (series.every((v) => v === series[0])) {
    return { ok: false, reason: 'CONSTANT_SERIES' }
  }
  return { ok: true }
}

async function ensureLSTM(series) {
  if (!modelCache.lstmTrained) {
    await timeSeriesService.trainModel(series)
    modelCache.lstmTrained = true
  }
}

async function ensureNN(series) {
  if (!modelCache.nnTrained) {
    await nnService.trainNetwork(series)
    modelCache.nnTrained = true
  }
}

async function maybeInitAdvanced() {
  if (!advancedMLService.isInitialized) {
    await advancedMLService.initialize()
  }
}

/**
 * Strategy selection logic
 */
function selectStrategy(series, options = {}) {
  const { latencyPreference = 'balanced' } = options
  const seasonality = detectSeasonality(series)
  const length = series.length

  if (length < 8) return 'linear'
  if (seasonality && length >= 24) return 'ensemble'
  if (latencyPreference === 'fast') return 'linear'
  if (length >= 50) return 'lstm'
  return 'smoothing'
}

export async function predict(series, options = {}) {
  const { horizon = 7, latencyPreference } = options
  const quality = basicQualityCheck(series)
  if (!quality.ok) {
    return {
      predictions: [],
      confidence: 0,
      strategy: 'rejected',
      reason: quality.reason,
      metadata: { horizon },
    }
  }

  const strategy = selectStrategy(series, { latencyPreference })

  try {
    if (strategy === 'linear') {
      const out = RegressionPredictionService.predictLinear(series, horizon)
      return { ...out, strategy }
    }
    if (strategy === 'smoothing') {
      const out = RegressionPredictionService.predictExponentialSmoothing(series, horizon)
      return { ...out, strategy }
    }
    if (strategy === 'lstm') {
      await ensureLSTM(series)
      const out = await timeSeriesService.predict(series.slice(-50), horizon)
      return { ...out, strategy }
    }
    if (strategy === 'ensemble') {
      await ensureLSTM(series)
      await ensureNN(series)
      await maybeInitAdvanced()
      // Build simple ensemble: linear + smoothing + lstm (first value) + advanced optional
      const linear = RegressionPredictionService.predictLinear(series, horizon)
      const smoothing = RegressionPredictionService.predictExponentialSmoothing(series, horizon)
      const lstm = await timeSeriesService.predict(series.slice(-50), horizon)

      // For advanced ensemble, attempt single-step using average of first predicted values
      const firstValues = [
        linear.predictions[0],
        smoothing.predictions[0],
        lstm.predictions[0],
      ].filter((v) => typeof v === 'number')
      const ensembleFirst = stats.mean(firstValues)

      const merged = {
        predictions: lstm.predictions.map((_, i) => {
          const vals = [
            linear.predictions[i],
            smoothing.predictions[i],
            lstm.predictions[i],
          ].filter((v) => typeof v === 'number')
          return stats.mean(vals)
        }),
        confidence: Math.min(
          0.95,
          (linear.confidence + smoothing.confidence + lstm.confidence) / 3 + 0.05,
        ),
        metadata: {
          components: ['linear', 'smoothing', 'lstm'],
          ensembleFirst,
          horizon,
        },
      }
      return { ...merged, strategy }
    }

    // fallback
    const fallback = RegressionPredictionService.predictLinear(series, horizon)
    return { ...fallback, strategy: 'fallback-linear' }
  } catch (err) {
    console.error('[orchestrator] prediction error:', err)
    return {
      predictions: [],
      confidence: 0,
      strategy: 'error',
      error: err.message,
      metadata: { horizon },
    }
  }
}

export default { predict }
