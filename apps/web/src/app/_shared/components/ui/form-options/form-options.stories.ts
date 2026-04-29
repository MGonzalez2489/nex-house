import type { Meta, StoryObj } from '@storybook/angular';
import { FormOptions } from './form-options';

const meta: Meta<FormOptions> = {
  // title: 'Components/FormOptions',
  title: 'Shared/UI/FormOptions',
  component: FormOptions,
  tags: ['autodocs'],

  argTypes: {
    submitSeverity: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'help',
        'danger',
      ],
    },
    cancelVariant: {
      control: 'radio',
      options: ['outlined', 'text', undefined],
    },
  },
};

export default meta;
type Story = StoryObj<FormOptions>;

export const Default: Story = {
  args: {
    callState: 'loaded',
    submitLabel: 'Guardar',
    cancelLabel: 'Cancelar',
    showCancel: true,
  },
};

export const Loading: Story = {
  args: {
    callState: 'loaded',
    isLoading: true,
    submitLabel: 'Enviando...',
  },
};

export const CustomLabels: Story = {
  args: {
    callState: 'loaded',
    submitLabel: 'Confirmar Registro',
    submitSeverity: 'success',
    cancelLabel: 'Volver atrás',
    cancelVariant: 'text',
  },
};

export const OnlySubmit: Story = {
  args: {
    callState: 'loaded',
    showCancel: false,
    submitLabel: 'Continuar',
  },
};
