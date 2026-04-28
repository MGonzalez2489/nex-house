import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthContainer } from './auth-container';

const meta: Meta<AuthContainer> = {
  title: 'Auth/Container',
  component: AuthContainer,
  decorators: [
    moduleMetadata({
      imports: [RouterTestingModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AuthContainer>;

export const Default: Story = {};
