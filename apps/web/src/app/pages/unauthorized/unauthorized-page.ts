import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-unauthorized-page",
  imports: [],
  templateUrl: "./unauthorized-page.html",
  styleUrl: "./unauthorized-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedPage {
  //TODO: re-design this page
  //TODO: close session without redirect
}
