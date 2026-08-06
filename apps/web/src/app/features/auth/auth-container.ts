import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BrandComponent } from "@shared/components";

@Component({
  selector: "app-auth-container",
  imports: [RouterOutlet, BrandComponent],
  templateUrl: "./auth-container.html",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthContainer {}
