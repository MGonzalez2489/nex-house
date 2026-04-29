import { Component, inject, OnInit } from '@angular/core';
import {
  provideRouter,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { AuthContainer } from './auth-container';
import { AUTH_ROUTES } from './auth.routes';
import { Login } from './pages/login/login';

// Componente auxiliar para evitar que Storybook instancie el container manualmente
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  // template: `<router-outlet></router-outlet>`,
  template: ` <nav
      class="p-4 bg-slate-800 flex gap-4 border-b border-slate-700 shadow-sm"
    >
      <button
        routerLink="/login"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
      >
        Ver Login
      </button>
      <button
        routerLink="/password-recovery"
        class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors"
      >
        Ver Recuperación
      </button>
    </nav>

    <main class="relative">
      <router-outlet></router-outlet>
    </main>`,
})
class ShellComponent implements OnInit {
  private router = inject(Router);

  async ngOnInit() {
    try {
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Navegación fallida:', err);
    }
  }
}

const meta: Meta<ShellComponent> = {
  title: 'Features/Auth/Full Flow',
  component: ShellComponent,
  decorators: [
    applicationConfig({
      providers: [provideRouter(AUTH_ROUTES)],
    }),
    moduleMetadata({
      imports: [AuthContainer, Login],
    }),
  ],
};

export default meta;
type Story = StoryObj<ShellComponent>;

export const InteractiveFlow: Story = {
  name: 'Flujo Interactivo Completo',
};
