# Design: react-mobile-picker Integration

## Architecture Overview

The integration will replace the existing HTML select elements with react-mobile-picker components while maintaining the existing form validation, data flow, and service integration patterns.

## Component Integration Strategy

### Current Implementation
- Uses HTML `<select>` elements within react-hook-form Controller
- Loads blocks on component mount, lots when block changes
- Handles loading states and validation errors
- Integrates with onboardingService for data fetching

### New Implementation
- Replace select elements with react-mobile-picker components
- Maintain Controller wrapper for form integration
- Preserve existing data fetching and validation logic
- Add mobile-optimized styling and interactions

## Technical Design

### Form Integration
```jsx
// Current pattern:
<Controller
  name="block"
  control={control}
  render={({ field }) => (
    <select {...field}>
      {/* options */}
    </select>
  )}
/>

// New pattern:
<Controller
  name="block"
  control={control}
  render={({ field }) => (
    <Picker
      valueGroups={{ block: field.value }}
      optionGroups={{ block: blockOptions }}
      onChange={(groupKey, value) => field.onChange(value)}
    />
  )}
/>
```

### Data Structure Mapping
- Convert availableBlocks array to picker optionGroups format
- Convert availableLots array to picker optionGroups format
- Handle loading states with picker placeholder options
- Maintain value mapping for form submission

### Responsive Design
- Show picker on mobile devices
- Fallback to select dropdown on desktop (optional)
- Ensure proper touch target sizes
- Maintain existing form layout and spacing

## State Management

### Existing State (Preserved)
- `availableBlocks` - array of block options
- `availableLots` - array of lot options
- `loadingBlocks` - boolean loading state
- `loadingLots` - boolean loading state
- `selectedBlock` - watched form value

### New State Requirements
- Picker visibility state (if using modal picker)
- Picker value formatting for display
- Option group formatting for picker consumption

## Styling Considerations

### CSS Integration
- Extend existing Onboarding.css with picker-specific styles
- Ensure picker fits within form layout
- Maintain consistent color scheme and typography
- Handle picker overlay positioning

### Mobile Optimization
- Touch-friendly picker wheel interaction
- Smooth scrolling animations
- Proper viewport handling
- Accessibility considerations

## Error Handling

### Validation Integration
- Maintain existing react-hook-form validation
- Display validation errors appropriately
- Handle picker value changes and validation triggers
- Preserve error message positioning and styling

### Loading States
- Show loading indicators in picker during data fetch
- Handle empty states gracefully
- Provide feedback for user interactions

## Performance Considerations

### Data Loading
- Preserve existing efficient data fetching patterns
- Minimize re-renders during picker interactions
- Optimize option group creation for large datasets

### Bundle Size
- Evaluate react-mobile-picker bundle impact
- Consider lazy loading if necessary
- Ensure minimal impact on app performance

## Testing Strategy

### Manual Testing
- Verify picker functionality on mobile devices
- Test form submission with picker values
- Validate error handling and loading states
- Ensure accessibility compliance

### Cross-platform Compatibility
- Test on iOS and Android devices
- Verify desktop fallback behavior
- Ensure consistent experience across screen sizes