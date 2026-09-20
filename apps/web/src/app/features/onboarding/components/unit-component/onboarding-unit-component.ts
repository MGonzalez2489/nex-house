import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CallState} from '@ngrx-toolkit/core';
import {CreateUnit} from '@nexhouse/shared-domain/interfaces';
import {BaseCatalogModel, NeighStreetModel, UserModel} from '@nexhouse/shared-domain/models';
import {Panel} from '@openng/optimus-ui/panel';
import {FormOptions, UnitFormComponent} from '@shared/components/forms';

@Component({
  selector: 'app-onboarding-unit-component',
  imports: [Panel, FormOptions, UnitFormComponent],
  templateUrl: './onboarding-unit-component.html',
  styleUrl: './onboarding-unit-component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingUnitComponent {
  next = output();
  prev = output();
  doSubmit = output<CreateUnit>();

  streets = input.required<NeighStreetModel[]>();
  unitTypes = input.required<BaseCatalogModel[]>();
  unitRoles = input.required<BaseCatalogModel[]>();
  isLoading = input<boolean>(false);
  callState = input<CallState>();
  user = input<UserModel>();
}
