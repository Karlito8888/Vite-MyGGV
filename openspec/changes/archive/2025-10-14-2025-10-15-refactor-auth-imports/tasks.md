## 1. Update Profile.jsx
- [x] 1.1 Replace `import { AuthContext } from '../utils/AuthContext'` with `import { useAuth } from '../utils/useAuth'`
- [x] 1.2 Replace `useContext(AuthContext)` with `useAuth()` hook
- [x] 1.3 Verify component still works correctly

## 2. Update Footer.jsx  
- [x] 2.1 Replace `import { AuthContext } from '../utils/AuthContext'` with `import { useAuth } from '../utils/useAuth'`
- [x] 2.2 Replace `useContext(AuthContext)` with `useAuth()` hook
- [x] 2.3 Verify component still works correctly

## 3. Update ProtectedRoute.jsx
- [x] 3.1 Replace `import { AuthContext } from '../utils/AuthContext'` with `import { useAuth } from '../utils/useAuth'`
- [x] 3.2 Replace `useContext(AuthContext)` with `useAuth()` hook
- [x] 3.3 Verify component still works correctly

## 4. Validation
- [x] 4.1 Check no AuthContext imports remain in the codebase
- [x] 4.2 Test authentication flow still works
- [x] 4.3 Verify all components render correctly