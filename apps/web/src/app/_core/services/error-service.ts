import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "@nexhouse/shared-domain/interfaces";
import { Observable, throwError } from "rxjs";

export interface FormattedError {
  message: string;
  statusCode?: number;
  originalError?: any;
  translationKey?: string; // For future translations
}

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  /**
   * Handles an error, formats it, logs it, and shows a notification to the user.
   * Then re-throws a formatted error Observable.
   * @param error The original error (can be HttpErrorResponse, Error, or any other).
   * @returns An Observable that emits a formatted error.
   */
  handleError(error: any): Observable<never> {
    const formattedError: FormattedError = formatError(error);
    console.log("formatedError", formattedError);

    this._logError(formattedError);
    this._showNotification(formattedError.message);

    // You could add logic here to navigate to a specific error page
    // if (formattedError.statusCode === 401) {
    //   this.router.navigate(['/login']);
    // } else if (formattedError.statusCode === 404) {
    //   this.router.navigate(['/not-found']);
    // }

    // Re-throws the formatted error so other catchError handlers or subscribers can handle it
    return throwError(() => formattedError);
  }

  private _logError(formattedError: FormattedError): void {
    console.error("ErrorService - Error Log:", {
      message: formattedError.message,
      statusCode: formattedError.statusCode,
      translationKey: formattedError.translationKey,
      originalError: formattedError.originalError, // You can decide whether to log the entire original error
    });
    // You could integrate with an external logging service here (e.g. Sentry, DataDog)
  }

  private _showNotification(message: string): void {
    // Implement your logic here to show notifications to the user.
    // You could inject an Angular Material SnackBar service, OptimusUI MessageService, etc.
    console.warn(`ErrorService - Notificación al usuario: ${message}`);
    // Hypothetical example:
    // this.toastService.error(message);
  }
}

export function formatError(error: any): FormattedError {
  let message = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
  let statusCode: number | undefined;
  let translationKey = "errors.unexpected";

  if (error instanceof HttpErrorResponse) {
    statusCode = error.status;
    if (error.error instanceof ErrorEvent) {
      // Network or client error (e.g. script error)
      message = `Error de red: ${error.error.message}`;
      translationKey = "errors.network";
    } else if (error.status === 0) {
      // The backend is not responding or the user is offline
      message =
        "No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.";
      translationKey = "errors.noConnection";
    } else if (error.error && typeof error.error === "object") {
      // API error with a specific response structure (e.g. ApiResponse)
      const apiError = error.error as ApiResponse<any>;
      if (apiError.message) {
        message = apiError.message;
        translationKey = `errors.api.${statusCode}`; // Or a more generic key if there is no specific one
      } else if (typeof error.error === "string") {
        // Sometimes the backend returns a plain string in error.error
        message = error.error;
        translationKey = `errors.api.${statusCode}`;
      } else {
        // Fallback for server errors with an unknown structure
        message = `Error del servidor (Código: ${statusCode}): ${error.statusText || "Error desconocido"}.`;
        translationKey = `errors.server.${statusCode}`;
      }
    } else {
      // Other unknown HTTP errors
      message = `Error en la solicitud (Código: ${statusCode}): ${error.message || error.statusText || "Error desconocido"}.`;
      translationKey = `errors.http.${statusCode}`;
    }
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    "statusCode" in error
  ) {
    // If the error is directly an object that satisfies our ApiResponse
    const apiError = error as ApiResponse<any>;
    statusCode = apiError.statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 600) {
      message = apiError.message;
      translationKey = `errors.api.${statusCode}`;
    }
  } else if (error instanceof Error) {
    // Generic JavaScript errors
    message = `Error de la aplicación: ${error.message}`;
    translationKey = "errors.application";
  }

  // Optional: Log the original error for debugging
  console.error("Error original interceptado:", error);

  return {
    message,
    statusCode,
    originalError: error,
    translationKey,
  };
}
