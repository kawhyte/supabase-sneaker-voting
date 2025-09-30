# Spacing System Documentation

## Overview

This project uses an 8-point grid spacing system inspired by Mailchimp's design language. The system provides mathematical consistency while incorporating optical half-steps for visual balance.

## Core Principles

### 1. Mathematical Foundation (8-Point Grid)
All base spacing values are divisible by 8px, ensuring:
- Consistent vertical rhythm
- Predictable layouts across breakpoints
- Easy mental math for designers and developers
- Alignment with common screen densities

### 2. Optical Adjustments (Half-Steps)
Four strategic half-steps (12px, 20px, 28px, 36px) provide visual balance for:
- Button padding that feels "just right"
- Comfortable element spacing
- Natural visual grouping
- Smooth transitions between levels

### 3. Semantic Naming
Human-readable names (xs, sm, md, base, lg, xl, 2xl-7xl) improve:
- Team communication
- Code readability
- Faster development
- Consistent mental models

## Spacing Scale Reference

### Core Scale (Mathematical Base)

| Level | Variable | Value | Use Case |
|-------|----------|-------|----------|
| 0 | `--spacing-0` | 0px | Resets, overlays |
| 1 | `--spacing-1` | 8px | Micro spacing |
| 2 | `--spacing-2` | 16px | Element spacing |
| 3 | `--spacing-3` | 24px | Component spacing |
| 4 | `--spacing-4` | 32px | Separation |
| 5 | `--spacing-5` | 40px | Section internal |
| 6 | `--spacing-6` | 48px | Section separation |
| 7 | `--spacing-7` | 56px | Large sections |
| 8 | `--spacing-8` | 64px | Major sections |
| 9 | `--spacing-9` | 72px | Page-level |
| 10 | `--spacing-10` | 80px | Page spacing |
| 11 | `--spacing-11` | 96px | Hero sections |
| 12 | `--spacing-12` | 128px | Ultra spacing |

### Optical Half-Steps (Visual Balance)

| Level | Variable | Value | Use Case |
|-------|----------|-------|----------|
| 1.5 | `--spacing-1\.5` | 12px | Between micro and element |
| 2.5 | `--spacing-2\.5` | 20px | Between element and component |
| 3.5 | `--spacing-3\.5` | 28px | Between component and separation |
| 4.5 | `--spacing-4\.5` | 36px | Between separation and section |

### Semantic Aliases (Team Communication)

#### Micro Level
```css
--space-xs: var(--spacing-1);    /* 8px - Icon gaps, checkbox spacing */
--space-sm: var(--spacing-1\.5); /* 12px - Button padding, input spacing */
```

#### Element Level
```css
--space-md: var(--spacing-2);      /* 16px - Default element spacing */
--space-base: var(--spacing-2\.5); /* 20px - Comfortable element spacing */
```

#### Component Level
```css
--space-lg: var(--spacing-3);      /* 24px - Card inner padding */
--space-xl: var(--spacing-4);      /* 32px - Component separation */
```

#### Section Level
```css
--space-2xl: var(--spacing-5);     /* 40px - Section internal */
--space-3xl: var(--spacing-6);     /* 48px - Section separation */
--space-4xl: var(--spacing-8);     /* 64px - Major sections */
```

#### Page Level
```css
--space-5xl: var(--spacing-10);    /* 80px - Page spacing */
--space-6xl: var(--spacing-11);    /* 96px - Hero sections */
--space-7xl: var(--spacing-12);    /* 128px - Ultra spacing */
```

### Special Utilities

```css
--gap-base: var(--spacing-2\.5);   /* 20px - Default grid/flex gap */
```

## Usage Examples

### Basic Spacing

```tsx
// ✅ Good - Using semantic spacing
<div className="p-[var(--space-lg)] gap-[var(--space-base)]">
  <button className="px-[var(--space-md)] py-[var(--space-sm)]">
    Click me
  </button>
</div>

// ❌ Bad - Hardcoded values
<div className="p-6 gap-4">
  <button className="px-4 py-3">
    Click me
  </button>
</div>
```

### Responsive Spacing

```tsx
// Manual control per breakpoint
<div className="p-[var(--space-md)] md:p-[var(--space-lg)] lg:p-[var(--space-xl)]">
  Content scales with viewport
</div>
```

### Negative Spacing (Overlaps)

```tsx
// For overlapping elements
<div className="-mt-[var(--space-lg)]">
  Overlap previous element by 24px
</div>
```

### Component Examples

#### Card Component
```tsx
<div className="p-[var(--space-lg)] gap-[var(--space-base)]">
  <h3 className="mb-[var(--space-sm)]">Card Title</h3>
  <p className="mb-[var(--space-md)]">Card content</p>
  <button>Action</button>
</div>
```

#### Form Layout
```tsx
<form className="space-y-[var(--space-lg)]">
  <div className="space-y-[var(--space-sm)]">
    <label>Name</label>
    <input className="p-[var(--space-sm)]" />
  </div>
  <button className="px-[var(--space-lg)] py-[var(--space-sm)]">
    Submit
  </button>
</form>
```

#### Dashboard Section
```tsx
<section className="mb-[var(--space-3xl)]">
  <h2 className="mb-[var(--space-lg)]">Dashboard</h2>
  <div className="grid gap-[var(--space-base)]">
    {/* Cards */}
  </div>
</section>
```

## Typography Integration

### Line Height Scale

```css
--line-height-tight: 24px;      /* 3 units - Headings, tight text */
--line-height-snug: 32px;       /* 4 units - Large headings */
--line-height-normal: 24px;     /* 3 units - Body text, paragraphs */
--line-height-relaxed: 32px;    /* 4 units - Comfortable reading */
--line-height-loose: 40px;      /* 5 units - Spacious content */
```

### Usage
```tsx
// Headings
<h1 style={{ lineHeight: 'var(--line-height-snug)' }}>
  Large Heading
</h1>

// Body text
<p style={{ lineHeight: 'var(--line-height-relaxed)' }}>
  Comfortable paragraph text
</p>
```

## Decision Tree

Use this flowchart to choose the right spacing:

```
┌─────────────────────────────────────┐
│ What are you spacing?               │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ┌───▼────┐         ┌────▼────┐
    │ Micro  │         │ Macro   │
    │ (icons,│         │ (layouts,│
    │ badges)│         │ sections)│
    └───┬────┘         └────┬────┘
        │                   │
  ┌─────▼─────┐       ┌─────▼─────┐
  │ space-xs  │       │ Component?│
  │ space-sm  │       └─────┬─────┘
  └───────────┘             │
                    ┌───────┴───────┐
                    │               │
              ┌─────▼─────┐   ┌─────▼─────┐
              │ Elements  │   │ Sections  │
              └─────┬─────┘   └─────┬─────┘
                    │               │
            ┌───────┴───────┐   ┌───┴────┐
        ┌───▼───┐   ┌───▼───┐   │space-  │
        │space- │   │space- │   │2xl-7xl │
        │md/base│   │lg/xl  │   └────────┘
        └───────┘   └───────┘
```

### Quick Reference

- **Icons, badges, small gaps**: `space-xs` (8px)
- **Button padding, input spacing**: `space-sm` (12px)
- **Default element spacing**: `space-md` (16px)
- **Comfortable spacing**: `space-base` (20px) ⭐ Most common
- **Card padding**: `space-lg` (24px)
- **Component separation**: `space-xl` (32px)
- **Section spacing**: `space-2xl` to `space-4xl` (40-64px)
- **Page-level spacing**: `space-5xl` to `space-7xl` (80-128px)

## Migration Guide

### From Hardcoded Tailwind Classes

| Old Class | New Class | Value | Semantic Name |
|-----------|-----------|-------|---------------|
| `gap-1`, `m*-1`, `p*-1` | `gap-[var(--space-xs)]` | 8px | Extra small |
| `gap-2`, `m*-2`, `p*-2` | `gap-[var(--space-md)]` | 16px | Medium |
| `gap-3`, `m*-3`, `p*-3` | `gap-[var(--space-sm)]` | 12px | Small |
| `gap-4`, `m*-4`, `p*-4` | `gap-[var(--space-base)]` | 20px | Base (default) |
| `gap-6`, `m*-6`, `p*-6` | `gap-[var(--space-lg)]` | 24px | Large |
| `gap-8`, `m*-8`, `p*-8` | `gap-[var(--space-xl)]` | 32px | Extra large |
| `gap-12`, `m*-12`, `p*-12` | `gap-[var(--space-3xl)]` | 48px | 3XL |
| `gap-16`, `m*-16`, `p*-16` | `gap-[var(--space-4xl)]` | 64px | 4XL |

### Migration Steps

1. **Find all hardcoded spacing**
```bash
grep -r "gap-[0-9]" components/
grep -r "m[tbxy]\?-[0-9]" components/
grep -r "p[tbxy]\?-[0-9]" components/
```

2. **Replace with semantic equivalents**
   - Use the mapping table above
   - Consult the decision tree for context-appropriate choices

3. **Test visually**
   - Run dev server
   - Check spacing looks correct
   - Verify responsive behavior

4. **Update responsive variants**
```tsx
// Before
<div className="p-4 md:p-6 lg:p-8">

// After
<div className="p-[var(--space-base)] md:p-[var(--space-lg)] lg:p-[var(--space-xl)]">
```

## Best Practices

### ✅ DO

- **Use semantic names** for better communication
- **Use `space-base` (20px)** as your default spacing
- **Use half-steps** when mathematical spacing feels wrong
- **Be consistent** within component families
- **Document exceptions** when breaking from the system

### ❌ DON'T

- **Mix hardcoded and semantic spacing** in the same component
- **Create arbitrary spacing values** outside the scale
- **Ignore responsive behavior** - plan for all breakpoints
- **Over-optimize** - consistency > perfect pixel values

## Common Patterns

### Container Spacing
```tsx
// Page container
<div className="container mx-auto px-[var(--space-md)]">
  {/* Container uses space-md (16px) padding */}
</div>
```

### Grid Layouts
```tsx
// Default grid gap
<div className="grid gap-[var(--gap-base)]">
  {/* Uses gap-base (20px) by default */}
</div>

// Tight grid
<div className="grid gap-[var(--space-md)]">
  {/* Uses space-md (16px) for denser layouts */}
</div>
```

### Stack Layouts
```tsx
// Vertical stack
<div className="space-y-[var(--space-base)]">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Section Separation
```tsx
<main>
  <section className="mb-[var(--space-3xl)]">
    First section
  </section>
  <section className="mb-[var(--space-3xl)]">
    Second section
  </section>
</main>
```

## Before/After Comparison

### Before: Inconsistent Spacing
```tsx
<div className="p-5 gap-3">
  <h2 className="mb-4">Title</h2>
  <p className="mt-3">Content</p>
  <button className="px-6 py-2">Action</button>
</div>
```
- Uses non-standard values (5, 3)
- Inconsistent rhythm
- Hard to maintain

### After: Semantic Spacing
```tsx
<div className="p-[var(--space-base)] gap-[var(--space-sm)]">
  <h2 className="mb-[var(--space-base)]">Title</h2>
  <p className="mt-[var(--space-sm)]">Content</p>
  <button className="px-[var(--space-lg)] py-[var(--space-sm)]">Action</button>
</div>
```
- Uses semantic scale
- Consistent vertical rhythm
- Clear intent

## Troubleshooting

### Spacing Feels Too Large
- Try the next smaller half-step
- Consider context: page sections need more breathing room than form elements

### Spacing Feels Too Small
- Try the next larger value
- Don't jump more than 2 levels at once

### Can't Find the Right Value
- Use the decision tree
- Check similar components for patterns
- When in doubt, use `space-base` (20px)

### Responsive Spacing Isn't Working
- Check breakpoint syntax: `md:p-[var(--space-lg)]`
- Ensure you're not mixing old and new spacing systems
- Test on actual devices, not just browser resize

## Tools & Resources

### Figma Plugin Settings
```
Base Unit: 8px
Scale: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128
Half-steps: 12, 20, 28, 36
```

### Browser DevTools
```css
/* Add to browser console to visualize spacing */
document.querySelectorAll('*').forEach(el => {
  el.style.outline = '1px solid rgba(255,0,0,0.1)';
});
```

### VS Code Snippets
```json
{
  "Semantic Padding": {
    "prefix": "space-p",
    "body": "p-[var(--space-${1|xs,sm,md,base,lg,xl,2xl,3xl,4xl,5xl,6xl,7xl|})]"
  },
  "Semantic Gap": {
    "prefix": "space-gap",
    "body": "gap-[var(--space-${1|xs,sm,md,base,lg,xl,2xl,3xl,4xl,5xl,6xl,7xl|})]"
  }
}
```

## Support

### Questions?
- Check the decision tree
- Review similar components
- Consult the quick reference table

### Need Help?
- Open an issue with "Spacing:" prefix
- Include component context and desired outcome
- Share screenshots if helpful

## Changelog

### 2025-09-30 - Initial Release
- Implemented 8-point grid spacing system
- Added 13 core spacing levels (0-128px)
- Included 4 optical half-steps (12, 20, 28, 36px)
- Defined semantic aliases (space-xs through space-7xl)
- Aligned typography line heights to grid
- Migrated 47 components to semantic spacing
- Created comprehensive documentation

---

**Remember**: Consistency beats perfection. When in doubt, use `space-base` (20px) and adjust from there.
