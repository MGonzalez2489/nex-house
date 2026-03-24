import { inject, Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly dialogService = inject(DialogService);
  private readonly dialogConfig: DynamicDialogConfig = {
    width: '50vw',
    modal: true,
    closable: true,
    closeOnEscape: true,
    header: 'Form',
    breakpoints: {
      '960px': '75vw',
      '640px': '90vw',
    },
  };

  open<T>(component: Type<T>, config?: Partial<DynamicDialogConfig>) {
    const nConf = config
      ? { ...this.dialogConfig, ...config }
      : this.dialogConfig;

    this.dialogService.open(component, nConf);
  }
}
