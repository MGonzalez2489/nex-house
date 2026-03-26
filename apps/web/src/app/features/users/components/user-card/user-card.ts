import { Component, input } from '@angular/core';
import { UserModel } from '@nex-house/models';
import { Card } from 'primeng/card';
import { RoleTag } from '../role-tag/role-tag';
import { UserStatusTag } from '../user-status-tag/user-status-tag';

@Component({
  selector: 'app-user-card',
  imports: [Card, RoleTag, UserStatusTag],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  user = input.required<UserModel>();
}
