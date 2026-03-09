# Test Suite

This directory contains unit tests for the TV Hub application.

## Setup

Tests are configured with:
- **Vitest** - Fast Vite-based test runner
- **Testing Library** - React component testing utilities
- **JSDOM** - Browser-like environment for testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/test/utils.test.ts

# Run tests matching a pattern
npm test -- --grep "auth"
```

## Test Files

- `utils.test.ts` - Tests for utility functions (cn, formatDate, formatDuration, formatViewCount)
- `auth.store.test.ts` - Tests for authentication Zustand store
- `api-client.test.ts` - Tests for API client configuration

## Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('my feature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Best Practices

- Keep tests focused and isolated
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies
- Aim for meaningful coverage, not 100%
