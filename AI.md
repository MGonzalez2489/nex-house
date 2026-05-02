# NexHouse - Guía de Contexto y Estándares de Ingeniería

## 🛠 Stack Tecnológico

- **Framework:** Angular 21.x+ (Uso intensivo de **Signals**, `inject()`, y nuevos flujos de control `@if` / `@for`).
- **Estilos:** Tailwind CSS.
- **UI Library:** PrimeIcons.
- **Estado:** Reactividad basada en Signals para servicios globales.

## 📐 Principios de Diseño (UI/UX)

- **Fondo General:** `bg-gray-50` (`#f9fafb`).
- **Tipografía:**
  - Títulos: `font-black`, `tracking-tight`, color `slate-900`.
  - Cuerpo: `text-slate-500`, tipografía limpia y legible.
- **Espaciado:** Diseño "Airy" (espacioso). Prioridad al espacio en blanco sobre bordes sólidos para separar secciones.
- **Componentes:**
  - **PageHeader:** Sin bordes inferiores. Título responsivo (`text-2xl` a `text-4xl`).
  - **Breadcrumbs:** Minimalistas, `text-[10px]`, uppercase, saltando IDs dinámicos (UUIDs) para mayor claridad.
  - **Sidebar:** Persistente en `localStorage`, con auto-apertura basada en la URL.

## 🚀 Arquitectura de Navegación

### 1. SidebarService

- **Persistencia:** Guarda el estado `collapsed` en `localStorage`.
- **Sincronización:** Escucha `NavigationEnd` para marcar el `activeId` y expandir menús padres automáticamente analizando los segmentos de la URL.
- **RBAC (Seguridad):** Filtrado de menú mediante **Whitelisting** (`roles: []` en el modelo). Si un item no tiene roles definidos, es público.

### 2. BreadcrumbService

- **Lógica:** Genera la ruta basada en la URL actual.
- **Mapeo:** Utiliza un diccionario (`BREADCRUMB_MAP`) con strings literales para evitar errores de inicialización de Enums.
- **Limpieza:** Filtra automáticamente segmentos que coinciden con patrones de ID/UUID.

### 3. Navegación Contextual

- **Regla de Cancelación:** Los formularios deben redirigir al nivel anterior del Breadcrumb o usar un `RouteMapperService` basado en el rol del usuario (**ROOT** vs **ADMIN**).

```
export interface NavItemModel {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  roles?: ('ROOT' | 'ADMIN' | 'RESIDENT')[];
  children?: NavItemModel[];
  badge?: string | number;
  isDisabled?: boolean;
}
```

### 4. Convenciones importantes:

1. Enums vs Config: No usar Enums directamente en archivos de configuración de nivel superior (como el mapa de Breadcrumbs) para evitar TypeError: Cannot read properties of undefined.

2. Angular Signals: Preferir signal, computed, y effect sobre RxJS para estados sincrónicos del UI.

3. Tailwind: Mantener el uso de utilidades nativas. Evitar CSS personalizado a menos que sea para animaciones específicas (ej: animate-fadein).

4. PrimeNG: Como framework de apoyo estamos utilizando PrimeNG en su version 21.x, cada componente debe de utilizar las ultimas actualizaciones de esta libreria para asegurar el correcto funcionamiento.
