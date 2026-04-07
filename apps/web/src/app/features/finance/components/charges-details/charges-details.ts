import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ChargeModel } from '@nex-house/models';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-charges-details',
  imports: [NgClass, CurrencyPipe, DatePipe, ButtonModule],
  templateUrl: './charges-details.html',
  styleUrl: './charges-details.css',
})
export class ChargesDetails {
  charge = input.required<ChargeModel>();
  private readonly ref = inject(DynamicDialogRef);
}
