import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-neighborhoods-container',
  imports: [RouterOutlet],
  standalone: true,
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class NeighborhoodsContainer {}
