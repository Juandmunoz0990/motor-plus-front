# Motor Plus Frontend

Frontend moderno para el sistema de gestión de talleres mecánicos Motor Plus.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 📦 Instalación

```bash
npm install
```

## 🏃 Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── layout/      # Componentes de layout (Navbar, Sidebar, etc.)
│   └── ui/          # Componentes UI básicos
├── pages/           # Páginas de la aplicación
├── services/        # Servicios API
├── hooks/           # Custom hooks
└── utils/           # Utilidades
```

## 🎨 Colores del Tema

- **Primary**: Azul (#0ea5e9) - Color principal
- **Secondary**: Gris (#64748b) - Textos y fondos
- **Success**: Verde (#22c55e) - Acciones exitosas
- **Accent**: Rojo (#ef4444) - Alertas y acciones destructivas

## 🔌 Configuración de API

Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**Nota:** El archivo `.env` no se incluye en el repositorio por seguridad. Asegúrate de crear tu propio archivo `.env` con las variables de entorno necesarias.

## ✅ Funcionalidades Implementadas

### Módulos Completos

1. **Dashboard**
   - Estadísticas en tiempo real
   - Resumen de clientes, órdenes, repuestos y facturas
   - Acciones rápidas

2. **Clientes**
   - Listado con búsqueda y filtros
   - Crear, editar y eliminar clientes
   - Ver detalles completos
   - Gestión de vehículos por cliente
   - Paginación

3. **Órdenes de Trabajo**
   - Listado con filtros por estado
   - Crear, editar y eliminar órdenes
   - Cambiar estado de órdenes
   - Ver detalles completos
   - Gestión de items, asignaciones y partes (preparado para implementación)

4. **Servicios**
   - Listado con búsqueda y filtros por estado
   - Crear, editar y eliminar servicios
   - Activar/desactivar servicios
   - Gestión de precios y descripciones

5. **Repuestos**
   - Listado con búsqueda
   - Crear, editar y eliminar repuestos
   - Gestión de inventario (stock)
   - Registrar movimientos de entrada/salida
   - Control de SKU y precios

6. **Facturas**
   - Listado con filtros por estado
   - Generar facturas desde órdenes completadas
   - Ver detalles completos de facturas
   - Gestión de estados (Borrador, Emitida, Pagada, Cancelada)

### Componentes UI

- Modal reutilizable
- Formularios con validación
- Tablas responsivas
- Paginación
- Componentes de entrada (Input, Textarea, Select)

### Servicios API

Todos los servicios están conectados con el backend:
- `clientsService` - Gestión de clientes
- `ordersService` - Gestión de órdenes
- `servicesService` - Gestión de servicios
- `partsService` - Gestión de repuestos
- `invoicesService` - Gestión de facturas
- `mechanicsService` - Gestión de mecánicos (preparado)
- `suppliersService` - Gestión de proveedores (preparado)
- `vehiclesService` - Gestión de vehículos (preparado)

## 📝 Próximos Pasos

- [ ] Implementar autenticación
- [ ] Agregar gestión completa de items en órdenes
- [ ] Implementar asignaciones de mecánicos
- [ ] Agregar gráficos y reportes al dashboard
- [ ] Implementar páginas de Mecánicos, Proveedores y Vehículos
- [ ] Agregar exportación de datos (PDF, Excel)
