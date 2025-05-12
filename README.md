# Task TODO Manager

Extensión para Visual Studio Code que permite gestionar de forma inteligente archivos `task.md` y `progress.md` para el seguimiento de tareas, WIDs y progreso.

## ✨ Características principales

- ✅ **Reconocimiento automático de secciones**: Solo se permiten encabezados válidos (`## TODO`, `## WID`, `## DONE`).
- ✏️ **Autocompletado de casillas de tareas**: Al presionar `Enter` dentro de una sección, se inserta automáticamente el marcador correspondiente:
  - `## TODO` → `- [ ]`
  - `## WID`  → `- [~]`
  - `## DONE` → `- [x]`
- 🧹 **Limpieza automática al guardar**:
  - Elimina tareas vacías o duplicadas.
  - Para `progress.md`, ignora los IDs (`[#001]`, `[#002]`, etc.) al detectar duplicados.
- ⚠️ **Validación de encabezados**: Si se usan encabezados inválidos, se muestra una advertencia.

## 📁 Estructura esperada

### `task.md`
```markdown
## TODO
- [ ] Preparar informe

## WID
- [~] Desarrollo del módulo

## DONE
- [x] Documentación completa

### progress.md

## TODO
- [ ] [#001] Preparar informe
- [ ] [#002] Revisar entregables

## WID 
- [~] Terminar versión release

## DONE
- [x] [#003] Publicar versión BETA

## 🛠️ Instalación

- Clona el repositorio o descarga el archivo .vsix.

- Instala la extensión manualmente:
''' code --install-extension task-vscode-0.0.1.vsix '''

### 📦 Desarrollo
## Requisitos

- Node.js

- TypeScript

- VS Code extensibility tools