# Proyecto: Registro de participantes para talleres

## Descripción

Aplicación web desarrollada con Node.js, Express, HTML, CSS, JavaScript y SQLite para administrar las inscripciones de participantes a diferentes talleres.

El sistema permite registrar, consultar, editar y eliminar inscripciones mediante una interfaz web. También incluye reportes estadísticos para visualizar la cantidad de participantes registrados por taller, horario y modalidad.

Los datos se almacenan en una base de datos SQLite, por lo que permanecen guardados incluso después de detener o reiniciar el servidor.

## Tecnologías utilizadas

- **HTML5:** estructura del formulario y de las secciones de la aplicación.
- **CSS3:** diseño visual y adaptación a diferentes tamaños de pantalla.
- **JavaScript:** interacción con el usuario y comunicación con la API mediante `fetch`.
- **Node.js:** entorno de ejecución del servidor.
- **Express:** implementación de las rutas de la API REST.
- **SQLite:** almacenamiento persistente de las inscripciones mediante el módulo `node:sqlite`.

## Requisitos

- Node.js 22.13.0 o superior, con soporte para `node:sqlite`.
- npm.
- Visual Studio Code u otro editor de código.
- Navegador web actualizado.
- Conexión a internet para instalar las dependencias inicialmente.

## Instalación y ejecución

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Abrir una terminal desde **Terminal → New Terminal**.
4. Instalar las dependencias:

   `npm install`

5. Iniciar el servidor:

   `npm start`

6. Abrir en el navegador:

   http://localhost:3000

El servidor utiliza el puerto `3000`.

La base de datos `registro_taller.db` y la tabla `inscripciones` se crean automáticamente cuando se inicia la aplicación por primera vez.

### Si PowerShell bloquea npm.ps1

Si PowerShell impide ejecutar los comandos de npm, utilizar:

```powershell
npm.cmd install
npm.cmd start
```

También se puede cambiar la terminal de Visual Studio Code a **Command Prompt** y ejecutar normalmente `npm install` y `npm start`.

## Funcionalidades

### Registro de participantes

El formulario permite ingresar los siguientes datos:

- Nombre completo.
- Correo electrónico.
- Teléfono.
- Taller.
- Horario.
- Modalidad.
- Nivel de experiencia.

Todos los campos son obligatorios.

### Consulta de inscripciones

Muestra los participantes almacenados en la base de datos, incluyendo sus datos y la fecha de registro.

### Edición de inscripciones

Permite seleccionar una inscripción existente, modificar sus datos y guardar los cambios.

### Eliminación de inscripciones

Permite eliminar una inscripción previa confirmación del usuario.

### Reportes estadísticos

La aplicación muestra:

- Total de participantes registrados.
- Cantidad de participantes por taller.
- Cantidad de participantes por horario.
- Cantidad de participantes por modalidad.

Los reportes se actualizan después de registrar, modificar o eliminar inscripciones.

## Validaciones

La aplicación incorpora validaciones tanto en el navegador como en el servidor.

- Los campos del formulario son obligatorios.
- Se verifica el formato del correo electrónico.
- Se verifica el formato del teléfono en el servidor.
- El servidor rechaza las solicitudes con campos vacíos o datos inválidos.
- Se comprueba que el identificador de una inscripción sea válido al editar o eliminar.
- Se informa cuando una inscripción solicitada no existe.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/inscripciones` | Consultar todas las inscripciones. |
| POST | `/api/inscripciones` | Registrar una nueva inscripción. |
| PUT | `/api/inscripciones/:id` | Actualizar una inscripción existente. |
| DELETE | `/api/inscripciones/:id` | Eliminar una inscripción. |
| GET | `/api/reportes/resumen` | Consultar las estadísticas de inscripciones. |

### Códigos de respuesta

- `200`: solicitud procesada correctamente.
- `201`: inscripción creada correctamente.
- `400`: datos enviados o identificador inválidos.
- `404`: inscripción no encontrada.
- `500`: error interno del servidor.

## Base de datos

Se utiliza SQLite mediante el módulo integrado `node:sqlite`.

La tabla principal se denomina `inscripciones` y contiene los siguientes campos:

| Campo | Tipo | Descripción |
|---|---|---|
| id | INTEGER | Identificador único autoincremental. |
| nombre | TEXT | Nombre completo del participante. |
| correo | TEXT | Correo electrónico. |
| telefono | TEXT | Número de teléfono. |
| taller | TEXT | Taller seleccionado. |
| horario | TEXT | Horario seleccionado. |
| modalidad | TEXT | Modalidad de participación. |
| nivel_experiencia | TEXT | Nivel de experiencia del participante. |
| fecha_registro | TEXT | Fecha y hora de registro, generadas automáticamente. |

Los archivos `node_modules/` y `registro_taller.db` se generan localmente y no deben subirse al repositorio.