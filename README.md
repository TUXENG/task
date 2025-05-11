# Task Manager (VS Code Extension)

Esta extensión de Visual Studio Code está diseñada para mantener el archivo `task.md` bien estructurado. Sus principales funciones incluyen:

- Validar que solo existan las secciones `## TODO`, `## WID` y `## DONE`.
- Insertar automáticamente `- [ ]`, `- [~]` o `- [x]` al presionar Enter dentro de cada sección.
- Prevenir tareas vacías o duplicadas dentro de `## TODO`.

## Instalación

1. Clona este repositorio en una carpeta local.
2. Abre la carpeta en VS Code.
3. Ejecuta `npm install` para instalar las dependencias.
4. Pulsa `F5` para abrir una nueva ventana de VS Code con la extensión activa en modo desarrollo.

## Uso

Edita tu archivo `task.md`. Las tareas serán automáticamente validadas y corregidas al guardar, y la extensión insertará la marca de tarea correspondiente según la sección donde estés escribiendo.

## Licencia

MIT
