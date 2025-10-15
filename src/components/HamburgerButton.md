# HamburgerButton Component

## Description
A reusable hamburger button component that toggles navigation menu visibility. Features smooth animations, accessibility support, and responsive design.

## Props

### `onToggle` (function, required)
- **Description**: Callback function called when the button is clicked
- **Type**: `() => void`
- **Example**: `onToggle={() => setIsOpen(!isOpen)}`

### `isOpen` (boolean, optional)
- **Description**: Whether the sidebar/menu is currently open
- **Type**: `boolean`
- **Default**: `false`
- **Usage**: Used for styling and ARIA attributes

## Features

### 🎨 **Styling**
- Uses project design system colors (`--color-primary`, `--color-surface`)
- Smooth hover and active animations
- Transform effects on icon
- Open state rotation animation

### ♿ **Accessibility**
- Proper ARIA labels (`aria-label`, `aria-expanded`)
- Keyboard navigation support
- Focus management with visible outlines
- High contrast mode support

### 📱 **Responsive**
- Touch-friendly 48px minimum size (accessibility compliant)
- Mobile-optimized interactions
- Reduced motion support
- Dark theme compatible

### 🎯 **States**
- **Default**: Standard button appearance
- **Hover**: Scale effect with color change
- **Active**: Pressed state with primary color
- **Focus**: Visible outline for keyboard navigation
- **Open**: Rotated icon to indicate active state

## Usage Example

```jsx
import HamburgerButton from './HamburgerButton'

function MyComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <HamburgerButton 
      onToggle={() => setIsMenuOpen(!isMenuOpen)}
      isOpen={isMenuOpen}
    />
  )
}
```

## CSS Classes

- `.hamburger-btn`: Main button container
- `.hamburger-btn.open`: Open state modifier
- `.hamburger-icon`: Icon container

## Dependencies
- `@heroicons/react/24/outline` (Bars3Icon)
- `HamburgerButton.css` for styling

## Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Touch devices with proper event handling
- Screen readers with ARIA support