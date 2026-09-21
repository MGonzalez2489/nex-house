import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "@core/services";
import { SearchUser } from "@nexhouse/shared-domain/interfaces";
import { ResidentsTable, ResidentStats } from "@residents/components";
import { RESIDENT_ROUTES_ENUM } from "@residents/resident.routes";
import { ResidentStore } from "@residents/resident.store";
import { Button } from "@openng/optimus-ui/button";
import { FormFeedback } from "@shared/components/forms";
import { CatalogsStore } from "@stores/catalogs.store";

@Component({
  selector: "app-resident-home-page",
  imports: [Button, FormFeedback, ResidentsTable, ResidentStats],
  templateUrl: "./resident-home-page.html",
  styleUrl: "./resident-home-page.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentHomePage implements OnInit {
  protected readonly router = inject(Router);
  protected readonly store = inject(ResidentStore);
  protected readonly catStore = inject(CatalogsStore);
  protected readonly sessionService = inject(SessionService);

  ngOnInit(): void {
    this.store.loadStats();
  }

  protected create(): void {
    this.router.navigate([`/${RESIDENT_ROUTES_ENUM.HOME}`, RESIDENT_ROUTES_ENUM.NEW]);
  }

  protected view(id: string): void {
    this.router.navigate([`/${RESIDENT_ROUTES_ENUM.HOME}`, id, "edit"]);
  }

  protected onSearch(filters: SearchUser) {
    this.store.loadAll(filters);
  }
}