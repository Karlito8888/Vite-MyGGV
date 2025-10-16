## Why
Replace the custom-built ImageCropper component with shadcn's professionally maintained image crop component to improve reliability, user experience, and reduce maintenance overhead.

## What Changes
- Add shadcn image crop component dependencies (react-image-crop, radix-ui)
- Replace custom ImageCropper.jsx with shadcn-based implementation
- Update Avatar component integration to use new cropper interface
- Remove custom ImageCropper.css styles
- Maintain existing functionality (square cropping, zoom, position controls)
- **BREAKING**: ImageCropper component API will change to match shadcn patterns

## Impact
- Affected specs: avatar-component
- Affected code: src/components/ImageCropper.jsx, src/styles/ImageCropper.css, src/components/Avatar.jsx
- Dependencies: Will add react-image-crop and additional radix-ui packages