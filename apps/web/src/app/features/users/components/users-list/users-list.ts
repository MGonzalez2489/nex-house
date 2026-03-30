import { Component, input, output } from '@angular/core';
import { UserModel } from '@nex-house/models';
import { UserAvatar } from '@shared/components/ui';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RoleTag } from '../role-tag/role-tag';
import { UserStatusTag } from '../user-status-tag/user-status-tag';

@Component({
  selector: 'app-users-list',
  imports: [CardModule, ButtonModule, UserAvatar, RoleTag, UserStatusTag],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList {
  users = input.required<UserModel[]>();
  isLoading = input.required<boolean>();

  inspect = output<UserModel>();
}
