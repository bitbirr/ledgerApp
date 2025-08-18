# Credit Debit Design System

## Overview
This document outlines the design system for the Credit Debit financial management application. The design system ensures consistency across all UI components while maintaining accessibility standards and supporting responsive layouts for all device sizes.

## Design Tokens

### Color Palette

#### Light Theme
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `210 20% 98%` | Page background |
| `--foreground` | `222 84% 4.9%` | Primary text |
| `--card` | `0 0% 100%` | Card backgrounds |
| `--card-foreground` | `222 84% 4.9%` | Card text |
| `--popover` | `0 0% 100%` | Popover backgrounds |
| `--popover-foreground` | `222 84% 4.9%` | Popover text |
| `--primary` | `221 83% 53%` | Primary actions, links |
| `--primary-foreground` | `210 40% 98%` | Text on primary buttons |
| `--secondary` | `210 40% 96%` | Secondary actions |
| `--secondary-foreground` | `222 84% 4.9%` | Text on secondary buttons |
| `--muted` | `210 40% 96%` | Muted backgrounds |
| `--muted-foreground` | `215 16% 47%` | Muted text |
| `--accent` | `210 40% 96%` | Accent elements |
| `--accent-foreground` | `222 84% 4.9%` | Text on accent elements |
| `--success` | `142 76% 36%` | Success states |
| `--success-foreground` | `355 100% 97%` | Text on success elements |
| `--warning` | `38 92% 50%` | Warning states |
| `--warning-foreground` | `48 96% 89%` | Text on warning elements |
| `--destructive` | `0 84% 60%` | Error, destructive actions |
| `--destructive-foreground` | `210 40% 98%` | Text on destructive buttons |
| `--border` | `214 32% 91%` | Border colors |
| `--input` | `214 32% 91%` | Input borders |
| `--ring` | `221 83% 53%` | Focus rings |

#### Dark Theme
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `222 84% 4.9%` | Page background |
| `--foreground` | `210 40% 98%` | Primary text |
| `--card` | `222 84% 4.9%` | Card backgrounds |
| `--card-foreground` | `210 40% 98%` | Card text |
| `--popover` | `222 84% 4.9%` | Popover backgrounds |
| `--popover-foreground` | `210 40% 98%` | Popover text |
| `--primary` | `217 91% 60%` | Primary actions, links |
| `--primary-foreground` | `222 84% 4.9%` | Text on primary buttons |
| `--secondary` | `217 32% 17%` | Secondary actions |
| `--secondary-foreground` | `210 40% 98%` | Text on secondary buttons |
| `--muted` | `217 32% 17%` | Muted backgrounds |
| `--muted-foreground` | `215 20% 65%` | Muted text |
| `--accent` | `217 32% 17%` | Accent elements |
| `--accent-foreground` | `210 40% 98%` | Text on accent elements |
| `--success` | `142 76% 36%` | Success states |
| `--success-foreground` | `355 100% 97%` | Text on success elements |
| `--warning` | `38 92% 50%` | Warning states |
| `--warning-foreground` | `48 96% 89%` | Text on warning elements |
| `--destructive` | `0 84% 60%` | Error, destructive actions |
| `--destructive-foreground` | `210 40% 98%` | Text on destructive buttons |
| `--border` | `217 32% 17%` | Border colors |
| `--input` | `217 32% 17%` | Input borders |
| `--ring` | `224 76% 78%` | Focus rings |

### Typography

#### Font Families
- `--font-sans`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
- `--font-mono`: 'JetBrains Mono', 'Fira Code', monospace

#### Font Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--font-size-xs` | 0.75rem (12px) | 400 | Helper text, captions |
| `--font-size-sm` | 0.875rem (14px) | 400 | Body text, labels |
| `--font-size-base` | 1rem (16px) | 400 | Primary body text |
| `--font-size-lg` | 1.125rem (18px) | 500 | Subheadings |
| `--font-size-xl` | 1.25rem (20px) | 600 | Headings |
| `--font-size-2xl` | 1.5rem (24px) | 700 | Page titles |
| `--font-size-3xl` | 1.875rem (30px) | 700 | Section headings |
| `--font-size-4xl` | 2.25rem (36px) | 800 | Main headings |

### Spacing System
Based on 4px grid:
- `--spacing-0`: 0
- `--spacing-1`: 0.25rem (4px)
- `--spacing-2`: 0.5rem (8px)
- `--spacing-3`: 0.75rem (12px)
- `--spacing-4`: 1rem (16px)
- `--spacing-5`: 1.25rem (20px)
- `--spacing-6`: 1.5rem (24px)
- `--spacing-8`: 2rem (32px)
- `--spacing-10`: 2.5rem (40px)
- `--spacing-12`: 3rem (48px)
- `--spacing-16`: 4rem (64px)
- `--spacing-20`: 5rem (80px)
- `--spacing-24`: 6rem (96px)
- `--spacing-32`: 8rem (128px)
- `--spacing-40`: 10rem (160px)
- `--spacing-48`: 12rem (192px)
- `--spacing-56`: 14rem (224px)
- `--spacing-64`: 16rem (256px)

### Border Radius
- `--radius-sm`: calc(var(--radius) - 4px) // 4px
- `--radius-md`: calc(var(--radius) - 2px) // 6px
- `--radius-lg`: var(--radius) // 8px
- `--radius-full`: 9999px

### Shadows
- `--shadow-sm`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- `--shadow`: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
- `--shadow-md`: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- `--shadow-lg`: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- `--shadow-xl`: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

### Breakpoints
- Mobile: ≤ 640px
- Tablet: 641px - 1024px
- Desktop: ≥ 1025px

### Z-Index Scale
- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

## Component Library

### Atoms

#### Button
Variants:
- Primary: For primary actions
- Secondary: For secondary actions
- Ghost: For subtle actions
- Destructive: For destructive actions
- Outline: For actions that need to stand out but not as much as primary
- Link: For actions that look like links

Sizes:
- sm: Small buttons
- md: Medium buttons (default)
- lg: Large buttons

States:
- Default
- Hover
- Focus
- Active
- Disabled
- Loading

#### Icon Button
Same variants as Button but circular/square with only an icon

#### Badge
Variants:
- Default
- Success
- Warning
- Destructive
- Neutral

#### Tag/Status
Variants:
- Success
- Warning
- Destructive
- Neutral

#### Avatar
Sizes:
- sm: 32px
- md: 40px (default)
- lg: 64px

#### Tooltip
Position variants:
- Top
- Right
- Bottom
- Left

#### Toast
Variants:
- Default
- Success
- Warning
- Destructive

#### Divider
- Horizontal
- Vertical

#### Progress
- Linear progress bar
- Circular progress indicator

#### Skeleton
- Rectangular
- Circular
- Text line

#### Pill
- With icon
- With close button

### Inputs

#### Text Input
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Number Input
Same states as Text Input

#### Currency Input
Same states as Text Input with monospace font

#### Textarea
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Select
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Combobox
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Date Picker
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Date Range Picker
States:
- Default
- Hover
- Focus
- Disabled
- Error
- Success

#### Switch
States:
- On
- Off
- Disabled

#### Checkbox
States:
- Checked
- Unchecked
- Indeterminate
- Disabled

#### Radio
States:
- Selected
- Unselected
- Disabled

#### File Input
With preview capability

#### Search Input
With debounce functionality

### Form Patterns

#### Labels
- Required indicator
- Optional indicator
- Help text

#### Validation States
- Error with message
- Success with message
- Warning with message

#### Async Validation
- Loading state
- Validation feedback

### Navigation

#### App Header
- Logo area
- Global search
- Business/Branch selector
- User menu
- Theme toggle

#### Mobile Bottom Navigation
- Icon with label
- Active state
- Badge support

#### Sidebar Navigation
- Collapsible
- Active item highlighting
- Grouped items
- Badges

#### Breadcrumb
- With separators
- Truncated for long paths

#### Tabs
- Underline style
- Pill style
- Icon support

#### Stepper
- Horizontal
- Vertical
- With descriptions

### Surfaces

#### Card
Variants:
- Base
- Hoverable
- Elevated

States:
- Default
- Hover
- Selected

#### Modal/Dialog
Sizes:
- sm
- md
- lg
- xl
- full-screen

#### Drawer
Positions:
- Left
- Right
- Top
- Bottom

#### Popover
Positions:
- Top
- Right
- Bottom
- Left

#### Banner/Inline Alert
Variants:
- Info
- Success
- Warning
- Destructive

#### Empty State
- With icon
- With title
- With description
- With action

### Data Display

#### Table
Features:
- Responsive (converts to cards on mobile)
- Sticky header
- Sortable columns
- Filterable columns
- Pagination
- Loading states
- Empty states
- Row actions

#### Data List
Mobile alternative to tables

#### Pagination
- Previous/Next buttons
- Page numbers
- Jump to page
- Items per page selector

#### Sort/Filter Chips
- Active state
- Removable

#### KPI Tiles
- With trend indicators
- With comparison
- With sparklines

#### Chart Card
- With Recharts
- Loading states
- Empty states
- Error states

### Feedback

#### Loading States
- Skeletons
- Spinners
- Progress bars

#### Offline Banner
- Visible when offline
- Dismissible
- Retry functionality

#### Error Fallbacks
- With retry button
- With error message
- With support contact

#### "No Results" Empty States
- With search term
- With filters applied
- With clear filters action

### Utilities

#### Copy To Clipboard
- Success feedback
- Error feedback

#### Download CSV
- Loading state
- Success feedback
- Error feedback

#### Responsive Container
- Breakpoint aware
- Padding adjustments

#### Safe Area Pads
- iOS safe area support
- Top padding
- Bottom padding

#### Scroll Area
- Custom scrollbar
- Smooth scrolling
- Auto-hide

## Accessibility

### WCAG AA Compliance
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Focus indicators for all interactive elements
- Keyboard navigation support
- Skip to content link
- Proper ARIA attributes

### Focus Management
- Visible focus rings
- Focus trapping in modals/drawers
- Return focus after closing modals/drawers
- ESC key to close modals/drawers

### Screen Reader Support
- Proper heading hierarchy
- Landmark roles
- ARIA labels
- Live regions for dynamic content

## Responsive Design

### Breakpoints
- Mobile: ≤ 640px
- Tablet: 641px - 1024px
- Desktop: ≥ 1025px

### Grid System
- 12 columns on tablet/desktop
- 16px base spacing
- 24px/32px on larger screens
- Max content width: 1200-1280px with comfortable gutters

### Mobile-First Approach
- Base styles for mobile
- Enhancements for tablet
- Further enhancements for desktop

### Touch Targets
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Proper sizing for fingers

## Performance

### Code Splitting
- Route-based code splitting
- Component-based code splitting
- Lazy loading for non-critical components

### Asset Optimization
- Tree-shaking for icons
- Image optimization
- Font optimization

### Loading Strategies
- Skeleton loading for data
- Progressive enhancement
- Critical CSS inlining

## Internationalization

### Text Direction
- RTL support with logical properties
- Language-specific font handling

### Content Organization
- Text in message files for future i18n
- Proper formatting for dates/currencies
- Adaptable layouts for different text lengths

## Dark Mode

### Implementation
- CSS variable switching
- System preference detection
- User preference persistence
- Smooth transitions between modes

### Contrast Assurance
- All color pairs maintain AA contrast
- Text readability in both modes
- Icon visibility in both modes