📂 Arquitectura de Almacenamiento NexHouse

1. Diseño de la Solución (Patrón Strategy)

Implementamos el patrón Strategy mediante la interfaz StorageProvider. Esto nos permite intercambiar el almacenamiento local por AWS S3 o Azure Blob Storage en el futuro sin tocar la lógica de negocio.

2. Implementación Local (NestJS)

StorageModule: Configura el servidor de archivos estáticos usando @nestjs/serve-static.

LocalStorageProvider: Gestiona el guardado físico en disco, organizando por subcarpetas (ej. /evidences, /avatars).

Configuración: Se extrae del .env mediante ConfigService.

3. Infraestructura y Docker

Volúmenes: Se utiliza un Named Volume en Docker Compose para persistencia.

Mapeo: La ruta del host se vincula a /app/uploads dentro del contenedor.

4. Próximos Pasos (Pendientes)

Backend: Crear el FilesController con interceptores de Multer.

Frontend: Crear UploadService y componente de selección de archivos.

Integración: Guardar la ruta del archivo en la base de datos de transacciones.
