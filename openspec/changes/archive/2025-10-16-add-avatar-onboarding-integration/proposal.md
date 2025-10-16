## Why
The current onboarding flow uses a simple URL input for avatar selection, which provides poor user experience and requires users to host their avatar images externally. Integrating the existing Avatar component with upload functionality will improve user experience and keep avatar storage within the application ecosystem.

## What Changes
- Replace `input#avatar_url` in Onboarding.jsx with Avatar component integration
- Display default avatar (src/assets/logos/ggv-100.png) when no avatar exists in profiles table
- Create a basic square image cropper component for avatar uploads
- Implement avatar upload functionality to save images in Supabase "avatars" bucket
- Update onboarding form to handle file uploads instead of URL input
- Modify onboarding service to support avatar file processing

## Impact
- Affected specs: avatar-component, onboarding-flow
- Affected code: src/pages/Onboarding.jsx, src/services/onboardingService.js, src/components/Avatar.jsx
- New components: Basic square cropper component
- Supabase storage: New "avatars" bucket configuration