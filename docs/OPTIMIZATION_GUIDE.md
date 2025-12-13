# Production Optimization Guide

## ⚡ Performance Optimization

### 1. Bundle Size Optimization

```javascript
// vite.config.js - Advanced splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('chart.js') || id.includes('recharts')) {
              return 'chart-vendor';
            }
            return 'vendor';
          }

          // Feature chunks
          if (id.includes('src/components/dashboard')) {
            return 'dashboard';
          }
          if (id.includes('src/components/reports')) {
            return 'reports';
          }
        },
      },
    },
  },
});
```

### 2. Code Splitting Strategies

```javascript
// Route-based splitting
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({
    default: module.Dashboard,
  })),
);

// Component-based splitting với preload
const HeavyChart = lazy(() =>
  import('./components/HeavyChart').then((module) => {
    // Preload related components
    import('./components/ChartControls');
    return module;
  }),
);

// Dynamic imports with error handling
const loadComponent = (componentPath) => {
  return lazy(() =>
    import(componentPath).catch((error) => {
      console.error('Component loading failed:', error);
      return import('./components/ErrorFallback');
    }),
  );
};
```

### 3. Memory Management

```javascript
// src/hooks/useMemoryOptimization.js
export const useMemoryOptimization = () => {
  const cleanupRef = useRef([]);

  const addCleanup = useCallback((cleanupFn) => {
    cleanupRef.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all registered functions
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return { addCleanup };
};

// Usage in components
const MyComponent = () => {
  const { addCleanup } = useMemoryOptimization();

  useEffect(() => {
    const subscription = dataStream.subscribe(handleData);
    addCleanup(() => subscription.unsubscribe());

    const timer = setInterval(updateData, 1000);
    addCleanup(() => clearInterval(timer));
  }, []);
};
```

## 🔄 Caching Strategies

### 1. Service Worker Implementation

```javascript
// public/sw.js
const CACHE_NAME = 'oas-app-v1';
const urlsToCache = ['/', '/static/css/main.css', '/static/js/main.js', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});
```

### 2. API Response Caching

```javascript
// src/utils/cacheManager.js
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  set(key, data, ttlMs = 300000) {
    // 5 minutes default
    this.cache.set(key, data);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Smart cache invalidation
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys()).filter((key) => regex.test(key));

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.ttl.delete(key);
    });
  }
}

export default new CacheManager();
```

## 🎯 UI/UX Optimization

### 1. Virtualization for Large Lists

```javascript
// src/components/VirtualizedTable.jsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({ data, height = 400 }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TableRow data={data[index]} />
    </div>
  );

  return (
    <List height={height} itemCount={data.length} itemSize={50} width="100%">
      {Row}
    </List>
  );
};
```

### 2. Progressive Image Loading

```javascript
// src/components/ProgressiveImage.jsx
const ProgressiveImage = ({ src, placeholder, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgSrc(src);
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  return (
    <div className="progressive-image">
      <img src={imgSrc} alt={alt} className={loading ? 'loading' : 'loaded'} {...props} />
      {loading && <div className="image-placeholder" />}
    </div>
  );
};
```

## 📊 Monitoring & Analytics

### 1. Performance Metrics

```javascript
// src/utils/performanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  startTiming(label) {
    this.metrics[label] = performance.now();
  }

  endTiming(label) {
    const startTime = this.metrics[label];
    if (startTime) {
      const duration = performance.now() - startTime;
      this.reportMetric(label, duration);
      delete this.metrics[label];
      return duration;
    }
  }

  reportMetric(label, value) {
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: label,
        value: Math.round(value),
      });
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${label} - ${value}ms`);
    }
  }

  // Core Web Vitals
  measureCoreWebVitals() {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.reportMetric.bind(this, 'CLS'));
      getFID(this.reportMetric.bind(this, 'FID'));
      getFCP(this.reportMetric.bind(this, 'FCP'));
      getLCP(this.reportMetric.bind(this, 'LCP'));
      getTTFB(this.reportMetric.bind(this, 'TTFB'));
    });
  }
}

export default new PerformanceMonitor();
```

### 2. User Behavior Tracking

```javascript
// src/utils/userTracking.js
export const trackUserInteraction = (action, element, metadata = {}) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: 'user_interaction',
      event_label: element,
      ...metadata,
    });
  }

  // Custom analytics
  GoogleSheetsService.logUserActivity(getCurrentUser()?.email, `ui_${action}`, {
    element,
    ...metadata,
  });
};

// Usage in components
const Button = ({ onClick, children, ...props }) => {
  const handleClick = (e) => {
    trackUserInteraction('click', 'button', {
      buttonText: children,
      timestamp: Date.now(),
    });
    onClick(e);
  };

  return (
    <BaseButton onClick={handleClick} {...props}>
      {children}
    </BaseButton>
  );
};
```

## 🔒 Security Optimization

### 1. Content Security Policy

```javascript
// vite.config.js - CSP Headers
export default defineConfig({
  plugins: [
    // ... other plugins
    {
      name: 'csp-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' https://api.telegram.org https://openapi.zalo.me;",
          );
          next();
        });
      },
    },
  ],
});
```

### 2. Input Sanitization

```javascript
// src/utils/sanitizer.js
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  }
  return input;
};

// Usage in forms
const FormInput = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const sanitized = sanitizeInput(e.target.value);
    onChange({ ...e, target: { ...e.target, value: sanitized } });
  };

  return <input value={value} onChange={handleChange} {...props} />;
};
```

## 📱 Mobile Optimization

### 1. Touch Gesture Support

```javascript
// src/hooks/useSwipeGestures.js
export const useSwipeGestures = (onSwipeLeft, onSwipeRight) => {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) onSwipeLeft?.();
    if (isRightSwipe) onSwipeRight?.();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};
```

### 2. Responsive Images

```javascript
// src/components/ResponsiveImage.jsx
const ResponsiveImage = ({ src, alt, sizes, ...props }) => {
  const generateSrcSet = (baseSrc) => {
    const sizes = [320, 480, 768, 1024, 1200];
    return sizes.map((size) => `${baseSrc}?w=${size}&q=80 ${size}w`).join(', ');
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
```

## 🚀 Advanced Optimization Techniques

### 1. Micro-frontends Support

```javascript
// src/utils/microfrontendLoader.js
export const loadMicrofrontend = async (name, url) => {
  // Dynamic script loading
  const script = document.createElement('script');
  script.src = url;
  script.async = true;

  return new Promise((resolve, reject) => {
    script.onload = () => {
      if (window[name]) {
        resolve(window[name]);
      } else {
        reject(new Error(`Microfrontend ${name} not found`));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Usage
const DashboardMicrofrontend = lazy(() =>
  loadMicrofrontend('Dashboard', '/microfrontends/dashboard.js'),
);
```

### 2. Edge Computing Integration

```javascript
// Cloudflare Workers example
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API route optimization
    if (url.pathname.startsWith('/api/')) {
      const cache = await caches.default.match(request);
      if (cache) return cache;

      const response = await fetch(request);
      if (response.ok) {
        const clonedResponse = response.clone();
        await caches.default.put(request, clonedResponse);
      }
      return response;
    }

    return fetch(request);
  },
};
```

### 3. Database Query Optimization

```javascript
// src/utils/queryOptimizer.js
class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.batchRequests = new Map();
  }

  // Batch multiple queries
  batchQuery(queries) {
    const batchId = Date.now();
    this.batchRequests.set(batchId, queries);

    // Process batch after small delay
    setTimeout(() => {
      this.processBatch(batchId);
    }, 50);

    return batchId;
  }

  async processBatch(batchId) {
    const queries = this.batchRequests.get(batchId);
    if (!queries) return;

    // Combine similar queries
    const combined = this.combineQueries(queries);

    // Execute combined queries
    const results = await Promise.all(combined.map((query) => this.executeQuery(query)));

    this.batchRequests.delete(batchId);
    return results;
  }
}
```

## 📈 Scalability Preparation

### 1. Horizontal Scaling

- API Gateway implementation
- Load balancer configuration
- Database sharding strategies
- CDN distribution

### 2. Vertical Scaling

- Memory optimization
- CPU usage optimization
- Bundle size reduction
- Network request optimization

### 3. Auto-scaling Configuration

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-oas-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: react-oas-app
  template:
    metadata:
      labels:
        app: react-oas-app
    spec:
      containers:
        - name: app
          image: react-oas-app:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
---
apiVersion: v1
kind: Service
metadata:
  name: react-oas-service
spec:
  selector:
    app: react-oas-app
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

Optimization guide này cung cấp comprehensive strategies để đảm bảo ứng dụng chạy efficiently ở production scale với optimal user experience.
