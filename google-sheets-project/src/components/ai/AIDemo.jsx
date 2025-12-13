/**
 * AI Demo Component - Test AI/ML Functionality
 * Real AI/ML with TensorFlow.js, Brain.js, OpenAI
 */

import { useState, useEffect } from 'react'
import './AIDashboard.css'

// Import AI Services
import advancedMLService from '../../services/ai/advancedMLService'
import intelligentPatternRecognition from '../../services/ai/intelligentPatternRecognition'
import realTimeProcessor from '../../services/ai/realTimeProcessor'
import { TimeSeriesPredictionService, RegressionPredictionService } from '../../services/ai/aiPredictiveService'

const AIDemo = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState({})
  const [logs, setLogs] = useState([])

  // Initialize AI services
  useEffect(() => {
    initializeAIServices()
  }, [])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
    console.log(`[${timestamp}] ${message}`)
  }

  const initializeAIServices = async () => {
    try {
      addLog('🚀 Initializing AI Services...', 'info')
      
      // Initialize Advanced ML Service
      const mlInitialized = await advancedMLService.initialize()
      addLog(`Advanced ML Service: ${mlInitialized ? '✅ Ready' : '❌ Failed'}`, mlInitialized ? 'success' : 'error')
      
      // Initialize Pattern Recognition
      const patternInitialized = await intelligentPatternRecognition.initialize()
      addLog(`Pattern Recognition: ${patternInitialized ? '✅ Ready' : '❌ Failed'}`, patternInitialized ? 'success' : 'error')
      
      // Initialize Real-time Processor
      realTimeProcessor.initializeDataStream('demo_stream', {
        bufferSize: 100,
        analytics: ['mean', 'trend', 'anomaly', 'prediction']
      })
      addLog('Real-time Processor: ✅ Ready', 'success')
      
      setIsInitialized(mlInitialized && patternInitialized)
      addLog('🎉 AI Services initialized successfully!', 'success')
    } catch (error) {
      addLog(`❌ Initialization failed: ${error.message}`, 'error')
    }
  }

  const runAIDemo = async () => {
    if (!isInitialized) {
      addLog('❌ AI Services not initialized', 'error')
      return
    }

    setIsRunning(true)
    setResults({})
    addLog('🤖 Starting AI Demo...', 'info')

    try {
      // Generate sample data
      const sampleData = generateSampleData()
      addLog(`📊 Generated ${sampleData.length} data points`, 'info')

      // Test 1: Time Series Prediction
      addLog('🧠 Testing Time Series Prediction...', 'info')
      const timeSeriesService = new TimeSeriesPredictionService()
      await timeSeriesService.initialize()
      
      const trainingData = sampleData.slice(0, 50)
      const testData = sampleData.slice(50, 60)
      
      const trainingResult = await timeSeriesService.trainModel(trainingData, 'demo_model')
      addLog(`Training completed: Loss = ${trainingResult.finalLoss.toFixed(4)}`, 'success')
      
      const prediction = await timeSeriesService.predict(testData, 7, 'demo_model')
      addLog(`Prediction confidence: ${(prediction.confidence * 100).toFixed(1)}%`, 'success')

      // Test 2: Pattern Recognition
      addLog('🔍 Testing Pattern Recognition...', 'info')
      const patternResult = await intelligentPatternRecognition.recognizeTimeSeriesPatterns(
        sampleData,
        ['trend', 'seasonal', 'cyclical', 'irregular']
      )
      addLog(`Pattern confidence: ${(patternResult.confidence * 100).toFixed(1)}%`, 'success')

      // Test 3: Real-time Processing
      addLog('⚡ Testing Real-time Processing...', 'info')
      sampleData.forEach((value, index) => {
        realTimeProcessor.addDataPoint('demo_stream', {
          value,
          timestamp: Date.now() - (sampleData.length - index) * 1000
        })
      })
      
      const streamStatus = realTimeProcessor.getAllStreamStatus()
      const batchResult = realTimeProcessor.processBatch('demo_stream')
      addLog(`Processed ${streamStatus.demo_stream?.totalProcessed || 0} data points`, 'success')

      // Test 4: Regression Prediction
      addLog('📈 Testing Regression Prediction...', 'info')
      const regressionResult = RegressionPredictionService.predictLinear(sampleData, 7)
      addLog(`Regression R²: ${regressionResult.metadata.r2.toFixed(3)}`, 'success')

      // Test 5: Advanced ML Insights
      addLog('💡 Testing Advanced ML Insights...', 'info')
      const insightsContext = {
        deepLearning: { confidence: prediction.confidence },
        patterns: patternResult,
        realTime: { processingLatency: 100 }
      }
      
      const insights = await advancedMLService.generateInsightsWithGPT(insightsContext, 'demo analysis')
      addLog(`Generated ${insights.insights?.length || 0} insights`, 'success')

      // Compile results
      setResults({
        timeSeries: {
          training: trainingResult,
          prediction: prediction,
          accuracy: (prediction.confidence * 100).toFixed(1) + '%'
        },
        patterns: {
          confidence: (patternResult.confidence * 100).toFixed(1) + '%',
          patterns: Object.keys(patternResult.patterns).length
        },
        realTime: {
          processed: streamStatus.demo_stream?.totalProcessed || 0,
          batchResult: batchResult
        },
        regression: {
          r2: regressionResult.metadata.r2.toFixed(3),
          confidence: (regressionResult.confidence * 100).toFixed(1) + '%'
        },
        insights: {
          count: insights.insights?.length || 0,
          source: insights.source
        }
      })

      addLog('🎉 AI Demo completed successfully!', 'success')
    } catch (error) {
      addLog(`❌ Demo failed: ${error.message}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const generateSampleData = () => {
    const data = []
    const baseValue = 100
    const trend = 0.5
    const seasonality = 20
    const noise = 10

    for (let i = 0; i < 100; i++) {
      const trendComponent = i * trend
      const seasonalComponent = seasonality * Math.sin((2 * Math.PI * i) / 12)
      const noiseComponent = (Math.random() - 0.5) * noise
      const value = baseValue + trendComponent + seasonalComponent + noiseComponent
      data.push(Math.max(0, value))
    }

    return data
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      case 'info': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  return (
    <div className="ai-demo">
      <div className="demo-header">
        <h1>🤖 AI/ML Demo - TensorFlow.js • Brain.js • OpenAI</h1>
        <p>Test real AI/ML functionality with advanced analytics</p>
      </div>

      <div className="demo-controls">
        <button 
          onClick={runAIDemo} 
          disabled={!isInitialized || isRunning}
          className="demo-button primary"
        >
          {isRunning ? '🔄 Running AI Demo...' : '🚀 Start AI Demo'}
        </button>
        
        <button 
          onClick={clearLogs}
          className="demo-button secondary"
        >
          🗑️ Clear Logs
        </button>
        
        <div className="status-indicator">
          {isInitialized ? '✅ AI Ready' : '⏳ Initializing...'}
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="demo-results">
          <h3>📊 AI Demo Results</h3>
          <div className="results-grid">
            <div className="result-card">
              <h4>🧠 Time Series Prediction</h4>
              <div className="result-metrics">
                <div className="metric">
                  <span className="label">Accuracy:</span>
                  <span className="value">{results.timeSeries?.accuracy || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span className="label">Training Loss:</span>
                  <span className="value">{results.timeSeries?.training?.finalLoss?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span className="label">Predictions:</span>
                  <span className="value">{results.timeSeries?.prediction?.predictions?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="result-card">
              <h4>🔍 Pattern Recognition</h4>
              <div className="result-metrics">
                <div className="metric">
                  <span className="label">Confidence:</span>
                  <span className="value">{results.patterns?.confidence || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span className="label">Patterns Found:</span>
                  <span className="value">{results.patterns?.patterns || 0}</span>
                </div>
              </div>
            </div>

            <div className="result-card">
              <h4>⚡ Real-time Processing</h4>
              <div className="result-metrics">
                <div className="metric">
                  <span className="label">Data Points:</span>
                  <span className="value">{results.realTime?.processed || 0}</span>
                </div>
                <div className="metric">
                  <span className="label">Status:</span>
                  <span className="value">✅ Active</span>
                </div>
              </div>
            </div>

            <div className="result-card">
              <h4>📈 Regression Analysis</h4>
              <div className="result-metrics">
                <div className="metric">
                  <span className="label">R² Score:</span>
                  <span className="value">{results.regression?.r2 || 'N/A'}</span>
                </div>
                <div className="metric">
                  <span className="label">Confidence:</span>
                  <span className="value">{results.regression?.confidence || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="result-card">
              <h4>💡 AI Insights</h4>
              <div className="result-metrics">
                <div className="metric">
                  <span className="label">Insights Generated:</span>
                  <span className="value">{results.insights?.count || 0}</span>
                </div>
                <div className="metric">
                  <span className="label">Source:</span>
                  <span className="value">{results.insights?.source || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="demo-logs">
        <h3>📝 Demo Logs</h3>
        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-timestamp">[{log.timestamp}]</span>
              <span className="log-icon">{getLogIcon(log.type)}</span>
              <span 
                className="log-message"
                style={{ color: getLogColor(log.type) }}
              >
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="no-logs">No logs yet. Start the AI demo to see activity.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIDemo
