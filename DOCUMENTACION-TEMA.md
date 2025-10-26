# 🎨 Sistema de Temas - Modo Oscuro

## 📋 Resumen
Se ha implementado un sistema centralizado de temas que permite cambiar entre modo claro y oscuro en toda la aplicación de forma sincronizada.

## ✨ Características

### 🔄 Sincronización Global
- **Un solo click** cambia el tema en toda la aplicación
- **Persistencia** automática en localStorage
- **Sincronización** inmediata entre todos los componentes
- **Sin flash** de contenido al cargar la página

### 🎯 Componentes Principales

#### 1. **ThemeService** (`src/app/core/services/theme.service.ts`)
Servicio centralizado que gestiona el estado del tema:
- `darkMode$`: Observable para suscribirse a cambios
- `toggleTheme()`: Cambia el tema
- `isDarkMode()`: Obtiene el estado actual
- Aplica la clase `dark-mode` al body automáticamente

#### 2. **Header Component**
- Botón de paleta (🎨) para cambiar el tema
- Se suscribe al servicio para actualizar su UI
- Color del navbar cambia dinámicamente

#### 3. **App Component**
- Inicializa el ThemeService al cargar
- Asegura que el tema se aplique desde el inicio

#### 4. **Script de Inicialización** (`index.html`)
- Aplica el tema guardado antes de que Angular cargue
- Previene el "flash" de contenido blanco

### 🎨 Estilos CSS (`styles.css`)

#### Colores del Modo Oscuro:
- **Fondo principal**: `#0f0f0f` (negro profundo)
- **Tarjetas**: `#1a1a1a` (gris muy oscuro)
- **Navbar**: `#0a1929` (azul oscuro)
- **Textos**: `#f5f5f5` - `#ffffff` (blancos con alto contraste)
- **Enlaces**: `#64b5f6` (azul claro vibrante)
- **Botones primarios**: `#1565c0` (azul medio)

#### Elementos Cubiertos:
✅ Navegación y menús
✅ Botones y controles
✅ Formularios e inputs
✅ Tarjetas y contenedores
✅ Textos y títulos
✅ Enlaces
✅ Footer
✅ Iconos
✅ Mensajes de error
✅ Bordes y sombras

## 🚀 Cómo Funciona

### Para el Usuario:
1. Hacer click en el botón de paleta (🎨) en el header
2. Todo el sitio cambia instantáneamente
3. La preferencia se guarda automáticamente
4. Al volver, el tema se mantiene

### Para Desarrolladores:

#### Uso Básico (Automático):
La mayoría de componentes **no necesitan código adicional**. Los estilos CSS se aplican automáticamente a todas las clases de Tailwind.

#### Uso Avanzado (Opcional):
Si necesitas conocer el estado del tema en tu componente:

```typescript
import { ThemeService } from '@core/services/theme.service';

export class MiComponente {
  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
}
```

## 📁 Archivos Modificados

1. ✅ `src/app/core/services/theme.service.ts` - NUEVO servicio
2. ✅ `src/app/app.ts` - Inicializa el servicio
3. ✅ `src/app/modules/principal/components/header/header.ts` - Usa el servicio
4. ✅ `src/app/modules/principal/components/header/header.html` - Botón y navbar dinámico
5. ✅ `src/styles.css` - Estilos del modo oscuro
6. ✅ `src/index.html` - Script de inicialización rápida

## 🎯 Ventajas del Enfoque

### ✨ Simple y Mantenible
- Un solo servicio centralizado
- CSS global con Tailwind
- No se repite código en cada componente

### 🚀 Performante
- Observable para reactividad eficiente
- CSS con transiciones suaves
- Carga inmediata sin flash

### 🔧 Extensible
- Fácil agregar más temas
- Cualquier componente puede suscribirse
- localStorage para persistencia

### ♿ Accesible
- Alto contraste en modo oscuro
- Fuentes optimizadas
- Transiciones suaves

## 🎨 Personalización

Para modificar los colores del modo oscuro, edita `styles.css`:

```css
body.dark-mode {
  background-color: #tu-color;
  color: #tu-color-texto;
}
```

Para agregar más elementos con estilos oscuros:

```css
body.dark-mode .tu-clase {
  background-color: #color-oscuro !important;
  color: #texto-claro !important;
}
```

## ✅ Testing

Prueba que el tema funciona:
1. ✅ Click en botón de paleta cambia el tema
2. ✅ Recargar página mantiene el tema
3. ✅ Navegar entre rutas mantiene el tema
4. ✅ Todos los textos tienen buen contraste
5. ✅ Todos los botones son visibles
6. ✅ Formularios son legibles

---

**¡Todo listo!** El sistema de temas está completamente implementado y funcionando. 🎉
