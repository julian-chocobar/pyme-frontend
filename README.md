# PyME Pastas Artesanales - Control de Acceso + Analytics

Una interfaz web prototipo para una PyME de pastas que integra control de acceso por reconocimiento facial con OpenCV y dashboards de producción.

## 🚀 Características Principales

### Control de Acceso
- **Reconocimiento Facial**: Captura desde webcam y verificación
- **Logs en Tiempo Real**: Registro automático de los accesos
- **Resultados Visuales**: Feedback inmediato de acceso concedido/denegado con niveles de confianza
- **Información Detallada**: Muestra datos completos del empleado al autorizar acceso

### Analytics y Dashboards
- **Dashboards Nativos**: Visualizaciones interactivas construidas con React y Tailwind (en desarrollo)
- **5 Métricas Principales**: 
  1. Producción de Lotes por Producto y Trimestre
  2. Lotes Producidos por Hora (mensual)
  3. Horas Trabajadas por Área
  4. Irregularidades por Área y Producto
  5. Porcentaje de Desperdicio por Producto
- **Datos Realistas**: Generados basados en el modelo de datos DER de la PyME
- **Vistas Configurables**: Overview, Producción y Calidad

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

3. **Abrir en navegador**
   - Navegue a `http://localhost:5173`
   - Permita acceso a la cámara cuando sea solicitado