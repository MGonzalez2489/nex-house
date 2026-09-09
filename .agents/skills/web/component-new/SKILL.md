---
name: component-new
description: Guidelines and constraints for creating modern Angular (v22+) components using Signals, Standalone architecture, and native syntax.
---

# Skill: Modern Angular Component Creation

Apply these rules whenever creating or scaffolding new components in this Angular v22+ workspace.

## 1. Core Component Metadata

- **Standalone First:** ALWAYS set `standalone: true` in the `@Component` decorator.
- **OnPush Strategy:** ALWAYS set `changeDetection: ChangeDetectionStrategy.OnPush`.
- **No Class Constructors:** NEVER inject dependencies via `constructor()`. ALWAYS use the `inject()` function.
- **No Direct HTTP Calls:** NEVER make direct API/HTTP service calls inside components. Data fetching and actions MUST be handled through the feature's `SignalStore`.

## 2. Signal-First State & Inputs

- **Inputs & Outputs:**
  - ALWAYS use `input()` or `input.required()` for component inputs. NEVER use `@Input()`.
  - ALWAYS use `output()` for events. NEVER use `@Output()` or `EventEmitter`.
  - ALWAYS use `model()` for two-way data bindings.
- **Derived & Mutable State:**
  - ALWAYS use `computed()` for synchronous derived state.
  - ALWAYS use `linkedSignal()` when local state depends on an input but requires local updates.
  - NEVER use `resource()` or `rxResource()` inside UI components. Keep async resources inside `SignalStore` or dedicated services.

## 3. RxJS Usage Boundaries

- **Strict Minimal Usage:** ONLY use RxJS for complex time-based operations (debounce, throttle, polling, WebSockets).
- **Signal Interoperability:** ALWAYS convert RxJS streams to Signals using `toSignal()` before binding to templates.
- **Lifecycle Safety:** ALWAYS handle unsubscriptions using `takeUntilDestroyed` or by passing a `DestroyRef` when registering streams outside the injection context.

## 4. Native Template Control Flow

- **Prohibited Directives:** NEVER use legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
- **Native Syntax:** ALWAYS use native syntax (`@if`, `@else`, `@switch`, `@case`, `@defer`).
- **Mandatory Track:** ALWAYS include a `track` expression when rendering lists with `@for`.

## 5. Forms Selection & Safety

- **Template-driven Forms:** Use Template-driven forms backed by Signals for simple controls, toggles, or search filters.
- **Reactive Forms:** Use Reactive Forms (`FormGroup`, `FormControl`) for complex, multi-step, or dynamic forms.
- **Strict Typing:** ALWAYS strictly type every form structure (`FormGroup<MyFormInterface>`). NEVER leave forms untyped or set to `any`.

## 6. Mandatory Testing Standard

- EVERY component MUST have a corresponding `.spec.ts` unit test file.
- Unit tests MUST cover:
  1. Component instantiation.
  2. DOM rendering and conditional logic (`@if`, `@for`).
  3. User interaction and `output()` emissions.

---

## Code Examples

### DO: Modern Angular v22+ Pattern

```typescript
import { Component, ChangeDetectionStrategy, inject, input, output, computed, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  // Dependency Injection
  private readonly userStore = inject(UserStore);

  // Signal Inputs & Outputs
  userId = input.required<string>();
  statusChange = output<string>();

  // Local & Derived Signals
  user = computed(() => this.userStore.getUserById(this.userId()));
  selectedRole = linkedSignal(() => this.user()?.defaultRole ?? 'viewer');

  onRoleChange(newRole: string) {
    this.selectedRole.set(newRole);
    this.statusChange.emit(newRole);
  }
}
```

### DON'T: Legacy Angular Pattern

```typescript
// DON'T: Constructor injection, @Input, EventEmitter, or default change detection
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() userId!: string;
  @Output() statusChange = new EventEmitter<string>();

  constructor(private userService: UserService) {} // DON'T
}
```
