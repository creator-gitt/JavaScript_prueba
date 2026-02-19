# 🚀 Hoja de Ruta: Evolución del Sistema Académico

## 1. 📊 Dashboard Administrativo (Business Intelligence)
**Prioridad: Alta**
Actualmente el administrador ve una pantalla vacía al entrar.
- **Implementación:** Tarjetas con contadores (Total Alumnos, Docentes, Materias) y gráficos.
- **Tecnología:** Chart.js (fácil de integrar vía CDN).

## 2. 💾 Sistema de Respaldo (Backup & Restore)
**Prioridad: Crítica**
Al usar IndexedDB, los datos viven solo en el navegador. Si se borra la caché, se pierden.
- **Implementación:** Botón que descarga la BD completa en un JSON y otro para "Cargar JSON".
- **Beneficio:** Evita pérdida de datos.

## 3. 📄 Reportes PDF (Documentación)
**Prioridad: Media**
Lo que da validez al sistema académico.
- **Implementación:** Generar "Boleta de Notas" y "Constancia de Inscripción" en PDF.
- **Tecnología:** jspdf.

## 4. 🎓 Lógica Académica Avanzada
**Prioridad: Media**
- **Prerrequisitos:** Validar malla curricular (ej. Matemáticas I antes de Matemáticas II).
- **Control de Cupos:** Limitar inscripciones por materia.
- **Horarios:** Validar choques de horas.

## 5. 🎨 UI/UX y Personalización
**Prioridad: Baja**
- **Modo Oscuro:** Toggle para dar aspecto moderno.
- **Foto de Perfil:** Guardar imágenes en base64 en la BD.
