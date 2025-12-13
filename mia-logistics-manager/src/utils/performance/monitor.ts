export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      throw new Error(`Timer for operation '${operation}' was not started`);
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    return duration;
  }

  getMetrics(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.metrics.get(operation);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const count = measurements.length;
    const total = measurements.reduce((sum, time) => sum + time, 0);
    const average = total / count;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { count, average, min, max, total };
  }

  getAllMetrics(): Record<
    string,
    {
      count: number;
      average: number;
      min: number;
      max: number;
      total: number;
    }
  > {
    const result: Record<string, any> = {};
    for (const [operation] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  clearMetrics(operation?: string): void {
    if (operation) {
      this.metrics.delete(operation);
    } else {
      this.metrics.clear();
    }
  }

  generateReport(): string {
    const metrics = this.getAllMetrics();
    let report = '📊 Performance Report\n';
    report += '===================\n\n';

    for (const [operation, data] of Object.entries(metrics)) {
      if (data) {
        report += `🔹 ${operation}:\n`;
        report += `   Count: ${data.count}\n`;
        report += `   Average: ${data.average.toFixed(2)}ms\n`;
        report += `   Min: ${data.min.toFixed(2)}ms\n`;
        report += `   Max: ${data.max.toFixed(2)}ms\n`;
        report += `   Total: ${data.total.toFixed(2)}ms\n\n`;
      }
    }

    return report;
  }
}
