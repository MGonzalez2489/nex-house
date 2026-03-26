import { Component, computed, input } from '@angular/core';
import { UserModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-user-unit-card',
  imports: [Card, ButtonModule],
  templateUrl: './user-unit-card.html',
  styleUrl: './user-unit-card.css',
})
export class UserUnitCard {
  user = input.required<UserModel>();

  unit = computed(() => {
    const cUser = this.user();
    if (!cUser) return;

    const unit = cUser.assignments[0]?.unit;

    if (!unit) return;

    return unit;
  });
}
