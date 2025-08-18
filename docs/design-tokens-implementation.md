# Design Tokens Implementation

## Overview
This document outlines the implementation of design tokens for the Credit Debit financial management application. The design tokens will support both light and dark modes while maintaining WCAG AA contrast requirements.

## Color Tokens

### Light Theme
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

### Dark Theme
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

## Typography Tokens

### Font Families
- `--font-sans`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
- `--font-mono`: 'JetBrains Mono', 'Fira Code', monospace

### Font Scale
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

## Spacing Tokens
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

## Border Radius Tokens
- `--radius-sm`: calc(var(--radius) - 4px) // 4px
- `--radius-md`: calc(var(--radius) - 2px) // 6px
- `--radius-lg`: var(--radius) // 8px
- `--radius-full`: 9999px

## Shadow Tokens
- `--shadow-sm`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- `--shadow`: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
- `--shadow-md`: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- `--shadow-lg`: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- `--shadow-xl`: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

## Z-Index Tokens
- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

## Implementation Plan

### 1. CSS Custom Properties
The design tokens will be implemented as CSS custom properties in the `:root` and `.dark` selectors in `index.css`.

### 2. Tailwind Configuration
Extend the Tailwind configuration to map the design tokens to utility classes.

### 3. JavaScript Constants
Create JavaScript constants for use in component logic where needed.

### 4. Theme Switching
Implement theme switching functionality with localStorage persistence and system preference detection.

### 5. Contrast Validation
Ensure all color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).