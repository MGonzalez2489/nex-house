import { ChangeDetectionStrategy, Component } from "@angular/core";
import { APP_CONSTANTS } from "@core/constants";

@Component({
  selector: "app-brand-component",
  imports: [],
  templateUrl: "./brand-component.html",
  styleUrl: "./brand-component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {
  constants = APP_CONSTANTS;
}
