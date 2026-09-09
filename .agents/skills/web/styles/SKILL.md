---
name: components-styling
description: Guidelines for component styling, UI component selection, Tailwind CSS v4 usage, and Optimus-UI integration.
---

# Skill: Component Styling & Design System Constraints

Apply these rules whenever designing UI, applying CSS/Tailwind classes, picking components, or managing icons within the workspace.

## 1. UI Component Selection Strategy (Optimus-UI First)

- **Check Library First:** ALWAYS inspect the Optimus-UI component library (`https://optimus.openng.org/`) before building custom UI controls or patterns.
- **Component Usage:** If an Optimus-UI component fulfills the structural and functional requirement (e.g., Modals, Buttons, Inputs, Tables), use it directly instead of scaffolding custom HTML/CSS.
- **Extensibility:** Customize Optimus-UI elements strictly using provided props, slots, or design tokens.

## 2. Icon System Standard

- **Primary Icon Library:** ALWAYS use the official Optimus-UI Icon set (`https://optimus.openng.org/icons`).
- **Custom Icons:** When an icon is not available in the core library, register it through Optimus-UI's Custom Icons feature (`https://optimus.openng.org/customicons`).
- **Forbidden Icon Sources:** NEVER import arbitrary icon SVGs or third-party icon packages directly into components without registering them in the Optimus-UI icon registry.

## 3. Styling Engine & Framework Rules (Tailwind CSS v4+)

- **Tailwind v4 Engine:** ALWAYS use Tailwind CSS v4+ utility syntax and modern features (e.g., `@theme` directives, native CSS variables, container queries).
- **Token & Theme Discovery:** Before creating or modifying UI elements, ALWAYS inspect existing theme tokens, color definitions, custom utilities, and breakpoints configured in the project.
- **Design Token First:** Use Tailwind design token classes (e.g., `bg-primary`, `text-surface-foreground`, `p-spacing-4`) rather than hardcoded arbitrary values (e.g., **DO NOT** use `bg-[#123456]` or `p-[13px]`).

## 4. CSS Location & Theme Architecture Constraints

- **No Local Component CSS:** NEVER write custom CSS/SCSS inside individual component style files (`.scss`, `.css`, or `@Component({ styles: [...] })`).
- **Centralized Theme Customization:** If global overrides, custom utilities, or theme extensions are strictly required, place them inside the `/src/app/theme/` directory.
- **Inline Style Prohibition:** NEVER use inline `style="..."` attributes on any template element.

## 5. Responsive & Layout Patterns

- **Mobile-First Breakpoints:** ALWAYS design layouts using Tailwind's mobile-first responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
- **Flexbox & Grid Utilities:** Structure layouts exclusively using Tailwind layout utilities (`flex`, `grid`, `gap-*`).

---

## Code Examples

### DO: Optimus-UI & Tailwind v4 Token Pattern

```html
<!-- Use Optimus-UI component, standard icons, and Tailwind utility tokens -->
<opt-button variant="primary" class="w-full sm:w-auto">
  <opt-icon name="user-add" class="mr-2 h-5 w-5" />
  <span>Add User</span>
</opt-button>
```

### DON'T: Custom Component CSS & Hardcoded Values

```html
<!-- DON'T: Hardcoded arbitrary values, inline styles, or raw inline SVGs -->
<button style="background-color: #0055ff;" class="p-[11px]">
  <svg class="h-4 w-4"><!-- Raw unmanaged SVG --></svg>
  <span>Add User</span>
</button>
```
