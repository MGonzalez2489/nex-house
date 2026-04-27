import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserCard, UserUnitCard } from '@features/users/components';
import { UsersStore } from '@features/users/users.store';
import { UserModel } from '@nex-house/models';
import { PageHeader } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-details-page',
  imports: [ButtonModule, UserUnitCard, UserCard, RouterLink, PageHeader],
  templateUrl: './user-details-page.html',
  styleUrl: './user-details-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsPage implements OnInit {
  protected readonly id = input.required<string>();
  protected readonly store = inject(UsersStore);
  protected readonly user = signal<UserModel | null>(null);

  ngOnInit(): void {
    this.getUserById(this.id());
  }

  private async getUserById(id: string) {
    const cUser = await this.store.findById(id);

    this.user.set(cUser);
  }
}
