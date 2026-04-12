import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { SessionService } from '@core/services';
import { ContextStore } from '@stores/context.store';
import { UserRoleEnum } from '@nex-house/enums';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthStore } from '@features/auth';
import { FinanceStore } from '@features/finance/stores';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Navbar, DrawerModule, ProgressSpinnerModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly sessionService = inject(SessionService);
  protected readonly contextStore = inject(ContextStore);
  protected readonly authStore = inject(AuthStore);
  protected readonly financeStore = inject(FinanceStore);
  sidebarVisible = signal(false);

  loadingContext = computed(() => {
    const cUser = this.sessionService.user();

    if (!cUser) return true;

    if (cUser.role === UserRoleEnum.SUPER_ADMIN) return false;

    const cContext = this.contextStore.neighborhood();
    const loadingContext = this.contextStore.loading();

    if (!cContext || loadingContext) return true;

    return false;
  });
}
