# Accessibility Implementation

## Overview
This document outlines the implementation of accessibility features for the Credit Debit financial management application to meet WCAG AA compliance standards.

## WCAG AA Compliance Requirements

### Perceivable
- Text alternatives for non-text content
- Audio/video alternatives
- Adaptable content presentation
- Distinguishable content

### Operable
- Keyboard accessible
- Enough time to read and use
- Seizures and physical reactions
- Navigable interface

### Understandable
- Readable text
- Predictable interface
- Input assistance

### Robust
- Compatible with current and future technologies

## Implementation Details

### Color Contrast
Ensure all text/background combinations meet AA contrast requirements:
- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

### Focus Management
```typescript
// client/src/lib/focus-manager.ts
export class FocusManager {
  static trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  }
  
  static returnFocus(returnElement: HTMLElement) {
    setTimeout(() => {
      returnElement.focus();
    }, 100);
  }
}
```

### Keyboard Navigation
```tsx
// client/src/components/KeyboardNavigation.tsx
import { useEffect } from 'react';

export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to content
      if (e.altKey && e.key === 'S') {
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
          skipLink.focus();
        }
      }
      
      // Close modals with ESC
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          const closeBtn = activeModal.querySelector('.modal-close');
          if (closeBtn) {
            (closeBtn as HTMLElement).click();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

### ARIA Attributes
```tsx
// client/src/components/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      FocusManager.trapFocus(modalRef.current);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="bg-card rounded-lg shadow-lg w-full max-w-md"
        role="document"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="modal-title" className="text-xl font-bold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div id="modal-description" className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Semantic HTML Structure
```tsx
// client/src/components/AppLayout.tsx
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content link */}
      <a 
        href="#main-content" 
        id="skip-to-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
      
      {/* Header with proper landmarks */}
      <header 
        role="banner" 
        className="bg-card border-b border-border"
      >
        <AppHeader />
      </header>
      
      {/* Main content with proper landmarks */}
      <div className="flex flex-1">
        <nav 
          role="navigation" 
          aria-label="Main navigation"
          className="hidden lg:block w-64 bg-card border-r border-border"
        >
          <SidebarNav />
        </nav>
        
        <main 
          id="main-content"
          role="main" 
          className="flex-1 overflow-auto"
        >
          {children}
        </main>
      </div>
      
      {/* Footer with proper landmarks */}
      <footer 
        role="contentinfo" 
        className="bg-card border-t border-border p-4"
      >
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Credit Debit. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
```

### Focus Indicators
```css
/* client/src/index.css */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
}

.focus-ring-animated {
  @apply transition-all duration-200 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
  transform: scale(1.02);
}

/* Visible focus rings for keyboard users only */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}

.focus-visible {
  @apply ring-2 ring-ring ring-offset-2;
}
```

### Screen Reader Text
```css
/* client/src/index.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Component-Specific Accessibility

### Form Components
```tsx
// client/src/components/forms/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  required,
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-1">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span 
            aria-label="required" 
            className="text-destructive ml-1"
          >
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 border rounded-md',
          error 
            ? 'border-destructive focus:ring-destructive' 
            : 'border-input focus:ring-ring'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
```

### Table Components
```tsx
// client/src/components/data/Table.tsx
interface TableProps {
  columns: { key: string; header: string }[];
  data: any[];
  caption?: string;
}

export const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  caption 
}) => {
  return (
    <div className="overflow-x-auto">
      <table 
        className="min-w-full divide-y divide-border"
        role="table"
        aria-label={caption}
      >
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Testing Strategy

### Automated Testing
- Use axe-core for accessibility testing
- Integrate with existing test suite
- Run accessibility checks in CI/CD pipeline
- Generate accessibility reports

### Manual Testing
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast testing
- Focus management testing

### User Testing
- Test with users with disabilities
- Gather feedback on accessibility features
- Iterate based on user needs
- Document accessibility issues

## Implementation Plan

### Phase 1: Core Accessibility Features
1. Implement focus management
2. Add semantic HTML structure
3. Create visible focus indicators
4. Add screen reader text

### Phase 2: Component Accessibility
1. Enhance form components
2. Improve table accessibility
3. Add ARIA attributes to modals
4. Implement keyboard shortcuts

### Phase 3: Testing and Validation
1. Set up automated accessibility testing
2. Conduct manual accessibility testing
3. Perform screen reader testing
4. Validate WCAG AA compliance

### Phase 4: Documentation and Training
1. Create accessibility guidelines
2. Document accessibility features
3. Provide team training
4. Establish accessibility review process

## Tools and Resources

### Testing Tools
- axe-core browser extension
- WAVE accessibility evaluator
- Lighthouse accessibility audits
- pa11y command-line tool

### Screen Readers
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### Color Contrast Checkers
- WebAIM Contrast Checker
- Colorable
- Contrast Ratio
- Accessible Colors

## Compliance Documentation

### WCAG 2.1 AA Success Criteria Mapping
| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text Content | Alt text for images, icons |
| 1.3.1 Info and Relationships | Semantic HTML structure |
| 1.3.2 Meaningful Sequence | Logical tab order |
| 1.4.3 Contrast (Minimum) | Color contrast compliance |
| 2.1.1 Keyboard | Full keyboard navigation |
| 2.4.1 Bypass Blocks | Skip to content link |
| 2.4.2 Page Titled | Descriptive page titles |
| 2.4.3 Focus Order | Logical focus order |
| 2.4.4 Link Purpose | Descriptive link text |
| 3.1.1 Language of Page | HTML lang attribute |
| 3.2.1 On Focus | No context changes on focus |
| 3.2.2 On Input | No context changes on input |
| 4.1.1 Parsing | Valid HTML structure |
| 4.1.2 Name, Role, Value | ARIA attributes |

## Ongoing Maintenance

### Accessibility Audits
- Quarterly accessibility audits
- Automated testing integration
- Manual testing schedule
- User feedback collection

### Training and Awareness
- Team accessibility training
- Accessibility guidelines documentation
- Code review accessibility checklist
- Accessibility champions program

### Continuous Improvement
- Monitor accessibility issues
- Prioritize accessibility fixes
- Track accessibility metrics
- Update accessibility documentation