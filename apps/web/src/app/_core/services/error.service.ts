import { Injectable } from '@angular/core';
import { FormattedError, formatError } from '@shared/utils';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  /**
   * Maneja un error, lo formatea, lo loguea y muestra una notificación al usuario.
   * Luego re-lanza un Observable de error formateado.
   * @param error El error original (puede ser HttpErrorResponse, Error, o cualquier otro).
   * @returns Un Observable que emite un error formateado.
   */
  handleError(error: any): Observable<never> {
    const formattedError: FormattedError = formatError(error);
    console.log('formatedError', formattedError);

    this._logError(formattedError);
    this._showNotification(formattedError.message);

    // Aquí podrías añadir lógica para navegar a una página de error específica
    // if (formattedError.statusCode === 401) {
    //   this.router.navigate(['/login']);
    // } else if (formattedError.statusCode === 404) {
    //   this.router.navigate(['/not-found']);
    // }

    // Re-lanza el error formateado para que otros catchError o suscriptores puedan manejarlo
    return throwError(() => formattedError);
  }

  private _logError(formattedError: FormattedError): void {
    console.error('ErrorService - Error Log:', {
      message: formattedError.message,
      statusCode: formattedError.statusCode,
      translationKey: formattedError.translationKey,
      originalError: formattedError.originalError, // Puedes decidir si quieres loguear todo el error original
    });
    // Aquí podrías integrar con un servicio de logging externo (ej. Sentry, DataDog)
  }

  private _showNotification(message: string): void {
    // Implementa aquí tu lógica para mostrar notificaciones al usuario.
    // Podrías inyectar un servicio de Angular Material SnackBar, PrimeNG MessageService, etc.
    console.warn(`ErrorService - Notificación al usuario: ${message}`);
    // Ejemplo ficticio:
    // this.toastService.error(message);
  }
}
