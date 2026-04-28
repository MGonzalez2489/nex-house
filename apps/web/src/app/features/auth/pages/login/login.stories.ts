import { signal } from '@angular/core';
import { AuthStore } from '@features/auth';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Login } from './login';

/**
 * El error "is not a function" en templates de Angular con Signals suele
 * ocurrir cuando el provider no se inyecta correctamente o el valor
 * se sobreescribe como un objeto estático en el mock.
 */

const createAuthStoreMock = (overrides: any = {}) => {
  // Forzamos la creación de signals individuales para evitar mutaciones
  const callStateSignal = signal(overrides.callState ?? 'INIT');
  const loadingSignal = signal(overrides.loading ?? false);
  const authSignal = signal(overrides.isAuthenticated ?? false);

  return {
    provide: AuthStore,
    useValue: {
      callState: callStateSignal,
      loading: loadingSignal,
      isAuthenticated: authSignal,
      login: async () => {
        console.log('Mock Login');
        return true;
      },
    },
  };
};

const meta: Meta<Login> = {
  title: 'Features/Auth/Login',
  component: Login,
  decorators: [
    moduleMetadata({
      // Importante: Asegúrate de que Login sea standalone o añade sus imports aquí
      imports: [],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Login>;

export const Default: Story = {
  decorators: [
    moduleMetadata({
      providers: [createAuthStoreMock()],
    }),
  ],
};

export const Loading: Story = {
  decorators: [
    moduleMetadata({
      providers: [createAuthStoreMock({ callState: 'LOADING', loading: true })],
    }),
  ],
};

export const ErrorState: Story = {
  decorators: [
    moduleMetadata({
      providers: [
        createAuthStoreMock({ callState: { error: 'Invalid credentials' } }),
      ],
    }),
  ],
};
