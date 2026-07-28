import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-auth-container",
  imports: [RouterOutlet],
  templateUrl: "./auth-container.html",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthContainer {}
