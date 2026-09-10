import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from "@angular/core";
import { Router, RouterOutlet, NavigationStart, NavigationCancel, NavigationError } from "@angular/router";
import { filter } from "rxjs";
import { StartupStore } from "@stores/startup.store";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  imports: [RouterOutlet],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  protected title = "web";

  protected readonly sStore = inject(StartupStore);
  protected isRouteLoaded = signal(false);

  private readonly routerSubscription = inject(Router).events
    .pipe(
      filter(
        (event) =>
          (event instanceof NavigationStart ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError) &&
          this.sStore.status() !== "READY",
      ),
    )
    .subscribe(() => this.isRouteLoaded.set(false));

  onActivate() {
    this.isRouteLoaded.set(true);
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }
}
