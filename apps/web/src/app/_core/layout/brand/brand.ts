import { ChangeDetectionStrategy, Component } from "@angular/core";
import { APP_CONSTANTS } from "@core/constants";

@Component({
  selector: "app-brand",
  imports: [],
  templateUrl: "./brand.html",
  styleUrl: "./brand.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Brand {
  constants = APP_CONSTANTS;
}
