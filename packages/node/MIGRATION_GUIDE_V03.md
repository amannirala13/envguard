# Migration Guide: EnvGuard v0.2.x → v0.3.0

## Breaking Changes

### 1. Auto-Loading Removed

**Reason**: The auto-load implementation had a race condition that caused secrets to be unavailable immediately after import.

**Before (v0.2.x):**

```javascript
// ❌ This no longer works
require('@envguard/node/config');
console.log(process.env.API_KEY); // undefined!
```

**After (v0.3.0):**

```javascript
// ✅ Explicit async loading
(async () => {
  await require('@envguard/node').config();
  console.log(process.env.API_KEY); // Now it works!
})();
```

### 2. --require Hook Removed

**Before (v0.2.x):**

```bash
# ❌ This no longer works
node --require @envguard/node/register app.js
```

**After (v0.3.0):**

```javascript
// Create entry.js
(async () => {
  await require('@envguard/node').config();
  require('./app');
})();
```

```bash
# Run with entry file
node entry.js
```

## Updated Examples

### Express.js

**Before:**

```javascript
require('@envguard/node/config');
const express = require('express');
const app = express();
app.listen(3000);
```

**After:**

```javascript
const envguard = require('@envguard/node');
const express = require('express');

(async () => {
  await envguard.config();
  const app = express();
  app.listen(3000);
})();
```

### Next.js

**Before:**

```javascript
// next.config.js
require('@envguard/node/config');
module.exports = {
  /* ... */
};
```

**After:**

```javascript
// next.config.js
const envguard = require('@envguard/node');

module.exports = (async () => {
  await envguard.config();
  return {
    /* ... */
  };
})();
```

### ES Modules with Top-Level Await

```javascript
// index.js (type: "module" in package.json)
import envguard from '@envguard/node';

// Top-level await (Node.js 14.8+)
await envguard.config();

// Your app code
import app from './app.js';
app.start();
```

## Why This Change?

The previous auto-load implementation used a "fire-and-forget" async IIFE:

```javascript
// Old implementation (broken)
(async () => {
  await load(); // Runs async
})(); // Returns immediately, doesn't wait

// Next line runs BEFORE secrets are loaded!
console.log(process.env.SECRET); // undefined
```

This caused timing issues where secrets weren't available when your app needed them.

The new approach is explicit and guaranteed to work:

```javascript
// New implementation (reliable)
await config(); // Waits for secrets to load
console.log(process.env.SECRET); // Always available
```

## Migration Checklist

- [ ] Replace `require('@envguard/node/config')` with async `await envguard.config()`
- [ ] Replace `import '@envguard/node/config'` with `await envguard.config()`
- [ ] Replace `--require @envguard/node/register` with entry file approach
- [ ] Wrap app initialization in async IIFE or use top-level await
- [ ] Test that secrets are available before app starts
- [ ] Update CI/CD scripts if using --require flag

## Need Help?

- See full documentation: `packages/node/README.md`
- Report issues: https://github.com/amannirala13/envguard/issues
