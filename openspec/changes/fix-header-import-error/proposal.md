## Why
Header.jsx has a broken import for `useUser` from UserContext.jsx causing a SyntaxError, and there's a resource preloading warning for ggv.png.

## What Changes
- Fix the import error in Header.jsx by creating the missing useUser hook
- Address the ggv.png preloading warning by adding proper as attribute
- Ensure proper export structure in UserContext.jsx

## Impact
- Affected specs: authentication, header-avatar-integration
- Affected code: src/components/Header.jsx, src/contexts/UserContext.jsx, src/hooks/