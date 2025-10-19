# Optimize Authentication & Onboarding Architecture

## Why
The current authentication and onboarding architecture has scattered logic across 7 files with redundant methods and deprecated code, making it difficult to maintain and modify while still providing good functionality.

## What Changes
- Create centralized `useOnboardingRedirect` hook to consolidate all redirect logic
- Create `useProtectedRoute` hook to extract route protection logic from ProtectedRoute component
- Remove deprecated methods from onboardingService (checkRedirectNeeded)
- Consolidate status verification methods (getOnboardingStatus vs getOnboardingStatusWithCache)
- Simplify AuthContext to focus only on core authentication state
- Reduce file count from 7 to 5 while maintaining all functionality

## Impact
- Affected specs: authentication, onboarding-flow
- Affected code: ProtectedRoute.jsx, onboardingService.js, AuthContext.jsx, useAutoRedirect.js, useAuth.js
- **BREAKING**: Internal architecture changes only - no external API changes

## Current State Analysis

### Strengths ✅
- **Centralization bien pensée**: onboardingService.js centralize la logique métier avec cache
- **Gestion d'état robuste**: AuthContext.jsx gère l'état global de manière propre
- **Séparation claire**: Entre service, contexte et composants
- **Cache de 5 minutes**: Pour réduire les requêtes DB
- **États de transition**: authTransitioning pour éviter les flickers
- **Real-time listeners**: Pour les notifications

### Points à améliorer ⚠️
- **Complexité répartie**: 7 fichiers pour 2 fonctionnalités = dispersion potentielle
- **Redondance de logique**: Plusieurs méthodes de vérification du statut
- **Logique de redirection éparpillée**: Entre ProtectedRoute, Onboarding, et useAutoRedirect
- **Dépréciations**: checkRedirectNeeded() marqué comme déprécié mais encore présent

## Proposed Changes

### 1. Create Centralized Redirect Hook
- **New file**: `src/hooks/useOnboardingRedirect.js`
- **Purpose**: Centraliser toute la logique de redirection
- **Benefits**: Élimine la duplication entre ProtectedRoute, Onboarding, et useAutoRedirect

### 2. Simplify onboardingService
- **Remove**: Méthodes dépréciées (checkRedirectNeeded)
- **Consolidate**: Méthodes de vérification du statut
- **Maintain**: Cache et logique métier existante

### 3. Extract ProtectedRoute Logic
- **New hook**: `src/hooks/useProtectedRoute.js`
- **Purpose**: Extraire la logique de redirection de ProtectedRoute dans un hook réutilisable
- **Benefits**: Component plus simple, logique réutilisable

### 4. Unify Loading States
- **Consolidate**: Multiples états de loading en un seul état cohérent
- **Simplify**: Éviter les multiples états de loading dispersés

## File Structure Impact

### Before (7 files)
```
src/
├── components/ProtectedRoute.jsx
├── services/onboardingService.js
├── utils/AuthContext.jsx
├── utils/useAuth.js
├── utils/useAutoRedirect.js
├── pages/Onboarding.jsx
└── pages/Login.jsx
```

### After (5 files)
```
src/
├── components/ProtectedRoute.jsx (simplified)
├── services/onboardingService.js (cleaned)
├── utils/AuthContext.jsx (simplified)
├── utils/useAuth.js (enhanced)
└── hooks/
    ├── useOnboardingRedirect.js (new)
    └── useProtectedRoute.js (new)
```

## Benefits

1. **Reduced Complexity**: 7 → 5 fichiers
2. **Centralized Logic**: Toute la logique de redirection dans un seul hook
3. **Eliminated Redundancy**: Plus de méthodes dupliquées
4. **Better Maintainability**: Logique centralisée et réutilisable
5. **Cleaner Code**: Suppression des méthodes dépréciées
6. **Consistent Patterns**: États de loading unifiés

## Implementation Strategy

1. **Phase 1**: Créer les nouveaux hooks centralisés
2. **Phase 2**: Migrer la logique existante vers les nouveaux hooks
3. **Phase 3**: Nettoyer les fichiers existants (supprimer méthodes dépréciées)
4. **Phase 4**: Mettre à jour les composants pour utiliser les nouveaux hooks
5. **Phase 5**: Tests et validation

## Risk Assessment

- **Low Risk**: Refactoring only, no functional changes
- **Backward Compatible**: Existing API maintained during transition
- **Incremental**: Can be implemented progressively
- **Rollback**: Easy to revert if issues arise

## Success Criteria

- [ ] All existing functionality preserved
- [ ] Reduced file count from 7 to 5
- [ ] No deprecated methods remaining
- [ ] Centralized redirect logic
- [ ] Unified loading states
- [ ] No performance regression