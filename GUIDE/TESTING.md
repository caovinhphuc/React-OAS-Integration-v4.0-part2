# 🧪 TESTING GUIDE - MIA.vn Google Integration

## 📋 Tổng Quan

Hướng dẫn testing cho toàn bộ hệ thống MIA.vn Google Integration, bao gồm:

- **Frontend React** (Jest + React Testing Library)
- **Backend Python** (unittest + pytest)
- **Integration Tests** (API, Google Services, Automation)
- **Health Checks** (System status, Dependencies)

---

## 🎯 Test Framework

### Frontend Testing

- **Jest** - Test runner (via react-scripts)
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation

### Backend Testing

- **unittest** - Python built-in testing framework
- **pytest** - Advanced Python testing (optional)
- **run_tests.py** - Automation system test runner

### Integration Testing

- **Node.js scripts** - Service connection tests
- **Health checks** - System status verification
- **API tests** - Backend API endpoints

---

## 🚀 Running Tests

### Frontend Tests (React)

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (non-interactive)
npm run test:ci

# Run specific test file
npm test -- App.test.js

# Run tests matching pattern
npm test -- --testNamePattern="renders component"
```

### Backend Tests (Python Automation)

```bash
# Run automation system tests
cd automation/one_automation_system
python run_tests.py

# Quick test automation
python quick_test.py

# Advanced quick test
python quick_test_advanced.py

# Test inventory
python quick_test-inventory.py

# Test specific components
python test_webdriver.py
python test_auth_system.py
python test_drive_upload.py
```

### Integration Tests

```bash
# Full integration test suite
npm run test:integration

# Individual service tests
npm run test:google      # Google APIs (Sheets, Drive)
npm run test:telegram    # Telegram bot connection
npm run test:email       # Email service (SendGrid)

# System health check
npm run health-check
```

### All Tests Summary

```bash
# Run all tests (Frontend + Integration)
npm test && npm run test:integration

# Run with coverage
npm run test:coverage && npm run test:integration
```

### Coverage Reports

After running `npm run test:coverage`, view reports at:

- **Terminal**: Immediate summary
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

---

## 📁 Test Structure

### Frontend Tests

```
src/
├── App.test.js          ✅ Basic sanity tests (5 tests passing)
└── setupTests.js        ✅ Jest configuration
```

### Backend Tests (Automation System)

```
automation/one_automation_system/
├── run_tests.py                    ✅ Main test runner
├── quick_test.py                   ✅ Quick automation test
├── quick_test_advanced.py          ✅ Advanced automation test
├── quick_test-inventory.py         ✅ Inventory test
├── test_webdriver.py               ✅ WebDriver/Selenium test
├── test_auth_system.py             ✅ Authentication test
├── test_drive_upload.py            ✅ Google Drive upload test
├── test_create_drive_folder.py     ✅ Drive folder creation test
└── test_service_account_new.py     ✅ Service account test
```

### Integration Test Scripts

```
scripts/
├── testGoogleConnection.js         ✅ Google API connection test
├── testTelegramConnection.js       ✅ Telegram bot test
├── testEmailService.js             ✅ Email service test
└── health-check.js                 ✅ System health check
```

### Coverage Thresholds

Current settings (relaxed for initial setup):

```javascript
{
  statements: 0%,
  branches: 0%,
  functions: 0%,
  lines: 0%
}
```

**Recommendation:** Gradually increase to:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

---

## Writing Tests

### Component Test Example

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders component', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('handles click event', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Service Test Example

```javascript
import { fetchData } from './dataService';

describe('dataService', () => {
  test('fetches data successfully', async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  test('handles errors gracefully', async () => {
    await expect(fetchData('invalid')).rejects.toThrow();
  });
});
```

### Redux Test Example

```javascript
import { configureStore } from '@reduxjs/toolkit';
import reducer, { increment, decrement } from './counterSlice';

describe('counterSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer });
  });

  test('increments value', () => {
    store.dispatch(increment());
    expect(store.getState().value).toBe(1);
  });

  test('decrements value', () => {
    store.dispatch(decrement());
    expect(store.getState().value).toBe(-1);
  });
});
```

---

## Test Organization

### Recommended Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.js
│   │   └── Button.css
│   └── ...
├── services/
│   ├── api.js
│   ├── api.test.js
│   └── ...
├── store/
│   ├── slices/
│   │   ├── userSlice.js
│   │   ├── userSlice.test.js
│   │   └── ...
│   └── store.js
└── App.test.js
```

### Naming Conventions

- Test files: `*.test.js` or `*.spec.js`
- Test folders: `__tests__/`
- Setup files: `setupTests.js`

---

## Best Practices

### 1. AAA Pattern (Arrange, Act, Assert)

```javascript
test('example test', () => {
  // Arrange: Set up test data
  const value = 5;

  // Act: Perform action
  const result = value * 2;

  // Assert: Verify result
  expect(result).toBe(10);
});
```

### 2. Test One Thing at a Time

```javascript
// ❌ Bad: Testing multiple things
test('component works', () => {
  const { container } = render(<Component />);
  expect(container).toBeTruthy();
  expect(screen.getByText('Hello')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});

// ✅ Good: Separate tests
test('component renders', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

test('handles button click', () => {
  render(<Component />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### 3. Use Descriptive Test Names

```javascript
// ❌ Bad
test('test1', () => { ... });

// ✅ Good
test('displays error message when API call fails', () => { ... });
```

### 4. Mock External Dependencies

```javascript
// Mock axios
jest.mock('axios');

test('fetches data', async () => {
  axios.get.mockResolvedValue({ data: { id: 1 } });
  const result = await fetchUser(1);
  expect(result.id).toBe(1);
});
```

---

## Common Test Scenarios

### Testing Async Code

```javascript
test('async function', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// Or with promises
test('promise', () => {
  return fetchData().then(data => {
    expect(data).toBeDefined();
  });
});
```

### Testing Error Handling

```javascript
test('throws error', () => {
  expect(() => {
    throwError();
  }).toThrow('Error message');
});

test('async error', async () => {
  await expect(asyncThrowError()).rejects.toThrow();
});
```

### Testing React Hooks

```javascript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('useCounter hook', () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build:prod
```

### Pre-commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ci && npm run lint"
    }
  }
}
```

---

## Debugging Tests

### Run Specific Test

```bash
npm test -- App.test.js
npm test -- --testNamePattern="renders component"
```

### Debug Mode

```bash
# Add debugger in test
test('debug test', () => {
  debugger;
  expect(true).toBe(true);
});

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output

```bash
npm test -- --verbose
npm test -- --coverage --verbose
```

---

## Troubleshooting

### Common Issues

**1. Module not found**

```bash
# Install missing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**2. Tests timeout**

```javascript
// Increase timeout
jest.setTimeout(10000);

// Or per test
test('slow test', async () => {
  // test code
}, 10000);
```

**3. Async tests don't complete**

```javascript
// Always return or await promises
test('async', async () => {
  await asyncFunction(); // ✅
});

test('async', () => {
  return asyncFunction(); // ✅
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Next Steps

### Phase 1: Basic Coverage (Current)

- [x] Setup test infrastructure
- [x] Create basic sanity tests
- [x] Configure coverage reporting

### Phase 2: Component Testing

- [ ] Test all React components
- [ ] Test user interactions
- [ ] Test conditional rendering
- [ ] Achieve 50% coverage

### Phase 3: Integration Testing

- [ ] Test Redux store
- [ ] Test API calls
- [ ] Test routing
- [ ] Achieve 70% coverage

### Phase 4: Full Coverage

- [ ] Test edge cases
- [ ] Test error scenarios
- [ ] Increase thresholds to 80%
- [ ] Add E2E tests

---

**Current Status:** ✅ Tests passing (5/5)
**Coverage:** 0% (baseline tests only)
**Next Goal:** Add component tests

---

## 🔍 Testing Backend Python (Automation System)

### Test Runner: `run_tests.py`

```bash
cd automation/one_automation_system
python run_tests.py
```

**Test Classes:**

- `TestSystemSetup` - Kiểm tra cấu hình hệ thống
- `TestEnvironmentVariables` - Kiểm tra biến môi trường
- `TestDependencies` - Kiểm tra dependencies
- `TestImports` - Kiểm tra imports

**Output:**

```
🤖 ONE Automation System - Test Runner
==================================================
✅ System check passed
🧪 Chạy test cases...
==================================================
✅ Tất cả tests đã pass!
🚀 Hệ thống sẵn sàng để chạy!
```

### Quick Tests

```bash
# Quick automation test
python quick_test.py

# Advanced quick test
python quick_test_advanced.py

# Inventory test
python quick_test-inventory.py
```

### Component Tests

```bash
# Test WebDriver/Selenium
python test_webdriver.py

# Test authentication
python test_auth_system.py

# Test Google Drive upload
python test_drive_upload.py

# Test Drive folder creation
python test_create_drive_folder.py

# Test service account
python test_service_account_new.py
```

---

## 🌐 Integration Testing

### Google Services Tests

```bash
# Test Google connection
npm run test:google

# Tests:
# - Google Sheets API connection
# - Google Drive API connection
# - Service Account authentication
# - Spreadsheet access
```

### Telegram Bot Tests

```bash
# Test Telegram connection
npm run test:telegram

# Tests:
# - Bot token validation
# - Webhook setup
# - Message sending
```

### Email Service Tests

```bash
# Test Email service
npm run test:email

# Tests:
# - SendGrid API connection
# - Email sending
# - Template rendering
```

### Full Integration Suite

```bash
# Run all integration tests
npm run test:integration

# Includes:
# - Google APIs test
# - Telegram test
# - Email test
# - Health check
```

---

## 🏥 Health Checks

### System Health Check

```bash
# Run health check
npm run health-check

# Checks:
# - Frontend status
# - Backend API status
# - Google Services status
# - Database connections
# - Environment variables
```

### Manual Health Checks

```bash
# Frontend health
curl http://localhost:3000/health

# Backend health
curl http://localhost:3001/health
curl http://localhost:8000/health

# Automation system health
cd automation/one_automation_system
python health_check.py
```

---

## 📊 Test Reports

### Frontend Coverage Reports

After running `npm run test:coverage`:

- **Terminal**: Immediate summary
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

### Integration Test Reports

Test reports are automatically generated:

- `email-test-report-YYYY-MM-DD.json`
- `telegram-test-report-YYYY-MM-DD.json`
- `health-report-YYYY-MM-DD.json`

### Backend Test Output

```bash
# Verbose output
python run_tests.py

# Save to file
python run_tests.py > test-results.txt 2>&1
```

---

## 🐛 Testing Troubleshooting (Extended)

### Backend Test Issues

**1. Import errors**

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**2. Missing test files**

```bash
# Check test files exist
ls -la automation/one_automation_system/test_*.py
```

**3. Environment variables missing**

```bash
# Check .env file
cat automation/one_automation_system/.env
```

### Integration Test Issues

**1. Google API errors**

```bash
# Check credentials
ls -la config/google-credentials.json

# Test connection manually
npm run test:google
```

**2. Service connection failures**

```bash
# Check service status
npm run health-check

# Verify environment variables
grep -r "GOOGLE\|TELEGRAM\|EMAIL" .env
```

---

## ✅ Test Status Summary

### Current Status

**Frontend:**

- ✅ Tests passing (5/5)
- ⚠️ Coverage: 0% (baseline tests only)

**Backend:**

- ✅ System tests: `run_tests.py`
- ✅ Quick tests: `quick_test.py`
- ✅ Component tests: Multiple test files

**Integration:**

- ✅ Google Services: Working
- ✅ Telegram Bot: Working
- ✅ Email Service: Working
- ⚠️ Health Check: Minor warnings

---

## 🎯 Next Steps (Updated)

### Phase 1: Frontend Component Testing

- [ ] Test all React components
- [ ] Test user interactions
- [ ] Test conditional rendering
- [ ] Achieve 50% coverage

### Phase 2: Backend Coverage

- [ ] Test all automation functions
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Achieve 70% coverage

### Phase 3: Integration Testing

- [ ] Test Redux store
- [ ] Test API calls
- [ ] Test routing
- [ ] Test WebSocket connections
- [ ] Achieve 70% coverage

### Phase 4: E2E Testing

- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Test complete user flows
- [ ] Test automation workflows
- [ ] Increase thresholds to 80%

---

**Last Updated:** November 24, 2025
**Version:** 4.0.0
