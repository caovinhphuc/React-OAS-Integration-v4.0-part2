import { Alert, Button, Card, Input, InputNumber, Select, Space, Typography } from 'antd'
import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import orchestrator from '../../services/ai/predictionOrchestrator'
import './AIPredictionDemo.css'

const { Title, Paragraph, Text } = Typography

/**
 * AI Prediction Demo
 * Một trang đơn giản cho phép nhập chuỗi thời gian và sinh dự báo qua predictionOrchestrator.
 * Features:
 *  - Nhập series số (comma / space)
 *  - Chọn horizon (bước dự đoán)
 *  - Chọn ưu tiên latency (fast / balanced)
 *  - Hiển thị: strategy, confidence, predictions
 *  - Biểu đồ kết hợp dữ liệu lịch sử + dự báo
 */
export default function AIPredictionDemo() {
  const [seriesInput, setSeriesInput] = useState('10,12,13,15,18,21,20,19,23,25,27,30')
  const [horizon, setHorizon] = useState(7)
  const [latencyPreference, setLatencyPreference] = useState('balanced')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function parseSeries(raw) {
    return raw
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter((v) => v.length)
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v))
  }

  async function handlePredict() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const series = parseSeries(seriesInput)
      if (!series.length) throw new Error('Chuỗi đầu vào rỗng hoặc không hợp lệ.')
      const prediction = await orchestrator.predict(series, { horizon, latencyPreference })
      setResult({ series, ...prediction })
    } catch (e) {
      setError(e.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const chartData = (() => {
    if (!result) return []
    const base = result.series.map((v, i) => ({ index: i + 1, value: v }))
    const lastIndex = base.length
    const preds = (result.predictions || []).map((p, i) => ({
      index: lastIndex + i + 1,
      predicted: p,
    }))
    // Merge by index
    const map = new Map()
    base.forEach((d) => map.set(d.index, { index: d.index, value: d.value }))
    preds.forEach((d) => {
      const existing = map.get(d.index) || { index: d.index }
      map.set(d.index, { ...existing, predicted: d.predicted })
    })
    return Array.from(map.values())
  })()

  return (
    <div className="ai-prediction-demo">
      <Title level={2}>🔮 AI Prediction Demo</Title>
      <Paragraph type="secondary">
        Demo sử dụng <Text code>predictionOrchestrator</Text> để tự động chọn chiến lược dự báo phù
        hợp (linear / smoothing / lstm / ensemble). Nhập chuỗi thời gian (tối thiểu vài điểm) và
        chọn horizon để xem kết quả.
      </Paragraph>

      <Card title="Cấu hình" className="config-card" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="field-group">
            <label>Dữ liệu chuỗi (numbers)</label>
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              value={seriesInput}
              onChange={(e) => setSeriesInput(e.target.value)}
              placeholder="Ví dụ: 10,12,13,15,18,21,20,19,23"
            />
          </div>
          <div className="inline-fields">
            <div>
              <label>Horizon</label>
              <InputNumber min={1} max={60} value={horizon} onChange={(v) => setHorizon(v || 1)} />
            </div>
            <div>
              <label>Latency Preference</label>
              <Select
                value={latencyPreference}
                onChange={(v) => setLatencyPreference(v)}
                options={[
                  { value: 'fast', label: 'fast (ưu tiên tốc độ)' },
                  { value: 'balanced', label: 'balanced (mặc định)' },
                  { value: 'accuracy', label: 'accuracy (thử LSTM khi đủ)' },
                ]}
                style={{ minWidth: 200 }}
              />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <Button type="primary" onClick={handlePredict} loading={loading}>
                Chạy dự báo
              </Button>
            </div>
          </div>
        </Space>
      </Card>

      {error && (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          message="Lỗi dự báo"
          description={error}
          showIcon
        />
      )}

      {result && !error && (
        <>
          <Card
            title={`Kết quả • Strategy: ${result.strategy || 'N/A'}`}
            className="result-card"
            size="small"
            extra={<span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>}
            style={{ marginTop: 16 }}
          >
            {result.reason && result.strategy === 'rejected' && (
              <Alert type="warning" message="Rejected" description={result.reason} showIcon />
            )}
            <Paragraph style={{ marginTop: 8, marginBottom: 4 }}>Biểu đồ</Paragraph>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Historical" />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ef4444"
                    name="Predicted"
                    strokeDasharray="5 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Paragraph style={{ marginTop: 12, marginBottom: 4 }}>Chi tiết JSON</Paragraph>
            <pre className="json-block">{JSON.stringify(result, null, 2)}</pre>
          </Card>
          <Card size="small" className="hints-card" title="Ghi chú" style={{ marginTop: 16 }}>
            <ul className="hints-list">
              <li>
                Chuỗi ngắn (&lt; 8) → Linear regression, chuỗi dài với seasonality → Ensemble.
              </li>
              <li>Latency = fast ưu tiên chiến lược nhẹ (linear / smoothing).</li>
              <li>LSTM cần đủ điểm dữ liệu (&gt;= lookback cấu hình) mới hoạt động.</li>
              <li>
                Confidence tính từ nhiều yếu tố (trend consistency, variability, model stats) → chỉ
                là chỉ báo tương đối.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
