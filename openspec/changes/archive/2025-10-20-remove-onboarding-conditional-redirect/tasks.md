## 1. Simplify ProtectedRoute Component
- [x] 1.1 Remove onboardingCompleted state and related logic
- [x] 1.2 Remove onboardingService import and calls
- [x] 1.3 Simplify authentication check to only verify user existence
- [x] 1.4 Update redirection logic to always redirect to onboarding after login

## 2. Update Login Component
- [x] 2.1 Modify social sign-in redirectTo to point to /onboarding
- [x] 2.2 Ensure email sign-in also redirects to onboarding

## 3. Clean Up Onboarding Service
- [x] 3.1 Remove unused getOnboardingStatus method if no longer needed
- [x] 3.2 Keep only completeOnboarding method for setting completion flag

## 4. Update Authentication Specification
- [x] 4.1 Remove conditional redirection requirements
- [x] 4.2 Add simple redirection to onboarding requirement

## 5. Update Onboarding Flow Specification  
- [x] 5.1 Remove conditional logic requirements
- [x] 5.2 Update flow to always go through onboarding after login