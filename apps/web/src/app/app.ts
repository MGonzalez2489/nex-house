import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StartupStore } from "@stores/startup.store";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  imports: [RouterOutlet],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected title = "web";

  protected readonly sStore = inject(StartupStore);
  protected isRouteLoaded = signal(false);
  onActivate() {
    this.isRouteLoaded.set(true);
  }
}
