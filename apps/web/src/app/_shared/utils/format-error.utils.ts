import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '@nex-house/interfaces';

export interface FormattedError {
  message: string;
  statusCode?: number;
  originalError?: any;
  translationKey?: string; // Para futuras traducciones
}

export function formatError(error: any): FormattedError {
  let message = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  let statusCode: number | undefined;
  let translationKey = 'errors.unexpected';

  if (error instanceof HttpErrorResponse) {
    statusCode = error.status;
    if (error.error instanceof ErrorEvent) {
      // Error de red o del cliente (ej. error en el script)
      message = `Error de red: ${error.error.message}`;
      translationKey = 'errors.network';
    } else if (error.status === 0) {
      // El backend no responde o el usuario está sin conexión
      message =
        'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.';
      translationKey = 'errors.noConnection';
    } else if (error.error && typeof error.error === 'object') {
      // Error de la API con una estructura de respuesta específica (ej. ApiResponse)
      const apiError = error.error as ApiResponse<any>;
      if (apiError.message) {
        message = apiError.message;
        translationKey = `errors.api.${statusCode}`; // O una clave más genérica si no hay una específica
      } else if (typeof error.error === 'string') {
        // A veces el backend devuelve un string puro en error.error
        message = error.error;
        translationKey = `errors.api.${statusCode}`;
      } else {
        // Fallback para errores de servidor con estructura desconocida
        message = `Error del servidor (Código: ${statusCode}): ${error.statusText || 'Error desconocido'}.`;
        translationKey = `errors.server.${statusCode}`;
      }
    } else {
      // Otros errores HTTP desconocidos
      message = `Error en la solicitud (Código: ${statusCode}): ${error.message || error.statusText || 'Error desconocido'}.`;
      translationKey = `errors.http.${statusCode}`;
    }
  } else if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    'statusCode' in error
  ) {
    // Si el error es directamente un objeto que cumple nuestra ApiResponse
    const apiError = error as ApiResponse<any>;
    statusCode = apiError.statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 600) {
      message = apiError.message;
      translationKey = `errors.api.${statusCode}`;
    }
  } else if (error instanceof Error) {
    // Errores de JavaScript genéricos
    message = `Error de la aplicación: ${error.message}`;
    translationKey = 'errors.application';
  }

  // Opcional: Loguear el error original para depuración
  console.error('Error original interceptado:', error);

  return {
    message,
    statusCode,
    originalError: error,
    translationKey,
  };
}
