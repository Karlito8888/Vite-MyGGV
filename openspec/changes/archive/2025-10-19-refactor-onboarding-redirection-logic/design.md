# Design: Refactor Onboarding Status Control and Redirection Logic

## Current Architecture Analysis

### Onboarding Status Flow
```
AuthContext.jsx (fetchOnboardingStatus) → Database → onboardingCompleted state
onboardingService.js (getOnboardingStatus) → Database → Return status
ProtectedRoute.jsx → Reads onboardingCompleted state → Redirect decision
```

### Redirection Flow
```
useAutoRedirect.js → Database (redirect_to_home) → Show notification + Clear flag
onboardingService.js (checkRedirectNeeded) → Database (redirect_to_home) → Return boolean
```

## Proposed Architecture

### Centralized Service Layer
```
onboardingService.js (enhanced):
├── getOnboardingStatus(userId) - Unified status checking
├── checkAndHandleRedirect(userId) - Combined redirect logic
├── clearRedirectFlag(userId) - Flag cleanup
└── setupRealtimeRedirectListener(userId, callback) - Real-time updates
```

### React Layer (Simplified)
```
AuthContext.jsx:
├── Uses onboardingService.getOnboardingStatus()
└── Manages onboardingCompleted state

useAutoRedirect.js:
├── Thin wrapper around onboardingService
└── Handles React-specific concerns (state, effects)

ProtectedRoute.jsx:
├── Reads onboardingCompleted from AuthContext
└── Unchanged redirect logic
```

## Key Design Decisions

### 1. Service-Centric Approach
- **Rationale**: Business logic belongs in services, not React components
- **Benefit**: Easier testing, reusability, and maintenance

### 2. Backward Compatibility
- **Rationale**: Existing components should continue working without changes
- **Benefit**: Lower risk of introducing bugs

### 3. Real-time Preservation
- **Rationale**: Current notification system provides good UX
- **Benefit**: Users get immediate feedback on approval

## Implementation Strategy

### Phase 1: Enhance onboardingService
- Add unified status checking methods
- Add combined redirect handling
- Add real-time listener setup

### Phase 2: Update React Components
- Refactor AuthContext to use enhanced service
- Simplify useAutoRedirect to wrapper pattern
- Verify ProtectedRoute continues working

### Phase 3: Cleanup
- Remove duplicate code
- Add comprehensive error handling
- Validate all scenarios work correctly

## Risk Mitigation

### Risk 1: Breaking existing functionality
- **Mitigation**: Maintain existing method signatures and behavior
- **Validation**: Test all onboarding flows before and after changes

### Risk 2: Real-time notifications lost
- **Mitigation**: Preserve existing Supabase realtime channel setup
- **Validation**: Test approval notification flow

### Risk 3: Performance regression
- **Mitigation**: Reuse existing database queries, add caching where appropriate
- **Validation**: Monitor database query patterns

## Success Criteria

1. All onboarding status checks use centralized service
2. All redirection logic consolidated in service layer
3. useAutoRedirect.js simplified to wrapper pattern
4. No breaking changes to existing functionality
5. Real-time notifications continue working
6. Code duplication eliminated
7. Error handling improved across all flows