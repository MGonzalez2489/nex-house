---
name: components-design
description: Guidelines for project-specific component design, HTML semantics, global styling rules, accessibility, and folder architecture.
---

# Skill: Component Design & Architectural Guidelines

Apply these rules when deciding component placement, structure, HTML semantics, styling, and dependency injection patterns.

## 1. Styling & Custom CSS Constraints

- **No Inline Styles:** NEVER use inline styles (`style="..."`) inside templates.
- **Global Styles First:** ALWAYS reuse existing global application utility classes and design tokens.
- **Minimal Custom Styles:** Writing custom CSS/SCSS inside component style files is heavily restricted and reserved ONLY for rare, highly specific component behaviors.

## 2. Semantic HTML & Accessibility (a11y)

- **Semantic HTML First:** ALWAYS structure templates using native semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<button>`). NEVER wrap everything in generic `<div>` or `<span>` elements.
- **Accessibility Attributes:** ALWAYS include required ARIA standards:
  - Proper `alt` text on `<img>` elements.
  - Explicit `aria-label` or `aria-labelledby` on interactive icon buttons.
  - Explicit `for` attributes on form labels matching input IDs.

## 3. Component Scope & Decoupling

- **Presentational Decoupling:** Components located in shared directories (`app/_shared/`) MUST remain pure presentational components.
- **No Direct Store Imports in Shared:** Shared UI components MUST NOT import feature-specific state, domain stores, or business logic. They MUST communicate strictly via Signal `input()` and `output()`.
