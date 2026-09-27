# 📦 Assets Necesarios para Invitación Cosmos Botánico

## 🖼️ Imágenes Requeridas

### Logo Liverpool
- **Ruta**: `src/assets/liverpool.png` (o `.svg`)
- **Uso**: Mesa de regalos - Logo oficial de Liverpool
- **Tamaño recomendado**: 200x80px (transparente)
- **Formato**: PNG con fondo transparente o SVG
- **Dónde conseguirlo**: Descarga el logo oficial de Liverpool desde su sitio web o banco de imágenes

### Ilustración Lluvia de Sobres (OPCIONAL)
- **Ruta**: `src/assets/sobre.png`
- **Uso**: Sección de regalos - Ilustración decorativa
- **Tamaño recomendado**: 200x200px
- **Formato**: PNG con fondo transparente
- **Nota**: Ya incluí un icono SVG inline, esta imagen es opcional

### Fotos de la Pareja/Boda
Agrega 4 fotos en las siguientes rutas:

1. **`src/assets/boda1.jpg`**
   - Uso: Galería de fotos - Primera imagen
   - Formato: JPG o WEBP
   - Tamaño recomendado: 800x800px (cuadrada)

2. **`src/assets/boda2.webp`**
   - Uso: Galería de fotos - Segunda imagen
   - Formato: WEBP o JPG
   - Tamaño recomendado: 800x800px (cuadrada)

3. **`src/assets/boda4.jpg`**
   - Uso: Galería de fotos - Tercera imagen
   - Formato: JPG o WEBP
   - Tamaño recomendado: 800x800px (cuadrada)

4. **`src/assets/boda5.jpg`**
   - Uso: Galería de fotos - Cuarta imagen
   - Formato: JPG o WEBP
   - Tamaño recomendado: 800x800px (cuadrada)

## 📁 Estructura de Carpetas

Crea la carpeta `assets` dentro de `src`:

```
src/
├── assets/
│   ├── liverpool.png      ← Logo Liverpool
│   ├── sobre.png          ← (Opcional) Ilustración sobre
│   ├── boda1.jpg          ← Foto 1
│   ├── boda2.webp         ← Foto 2
│   ├── boda4.jpg          ← Foto 3
│   └── boda5.jpg          ← Foto 4
├── invitacion/
│   └── InvitacionView.jsx
└── ...
```

## 🎨 Ilustraciones SVG Incluidas (No requieren archivos)

Las siguientes ilustraciones ya están incluidas como SVG inline en el código:

✅ **Ornamentos botánicos** (ramas con hojas en esquinas)
✅ **Ilustración de pareja estilizada** (sin rostros, estilo editorial)
✅ **Icono de anillos entrelazados**
✅ **Icono de iglesia/ceremonia**
✅ **Icono de copa/brindis**
✅ **Icono de sobre** (alternativa al PNG)
✅ **Iconos básicos** (calendario, ubicación, check, etc.)

## 🎵 Audio (Opcional)

Si deseas agregar música de fondo:
- **Ruta**: Define en la variable `MUSIC_URL` del componente
- **Formato**: MP3
- **Ejemplo**: `"/music/cancion-boda.mp3"`

## ✅ Checklist de Implementación

- [ ] Crear carpeta `src/assets/`
- [ ] Descargar logo de Liverpool (PNG transparente)
- [ ] Agregar 4 fotos de la pareja/boda (formato cuadrado)
- [ ] (Opcional) Agregar ilustración de sobre
- [ ] Reemplazar `InvitacionView.jsx` con `InvitacionView_COSMOS.jsx`
- [ ] Verificar que todas las rutas de imágenes sean correctas
- [ ] Probar la invitación con `npm run dev`

## 🔧 Notas Técnicas

### Si una imagen no carga:
1. Verifica que la ruta sea correcta
2. Asegúrate de que el archivo exista en `src/assets/`
3. Revisa la consola del navegador para errores
4. Prueba con diferentes formatos (JPG, PNG, WEBP)

### Optimización de imágenes:
- Comprime las fotos antes de subirlas (usa TinyPNG o similar)
- Tamaño máximo recomendado: 500KB por imagen
- Formato WEBP es más ligero que JPG

### Rutas alternativas:
Si prefieres usar la carpeta `public/` en lugar de `src/assets/`:
- Cambia `/src/assets/` por `/assets/` en el código
- Coloca las imágenes en `public/assets/`

## 🎨 Paleta de Colores Cosmos Botánico

- **Verde Botánico**: `#6B8E7F`
- **Verde Claro**: `#A8C5BA`
- **Azul Marino**: `#2C5F6F`
- **Dorado**: `#B8A07E`
- **Acento Rojo**: `#C85A54`
- **Fondo**: `#FDFDFB` (blanco marfil)

## 📝 Datos a Personalizar

Edita estas constantes en el componente:

```javascript
const NOVIOS = "Armando & Mireya";
const FECHA_EVENTO_TXT = "Sábado 14 de Marzo, 2026";
const HORA_EVENTO_TXT = "5:00 PM";
const LUGAR_TXT = "Jardín la Flor";
const DIRECCION_TXT = "Calle de las Flores #123, Colonia Centro, Cuernavaca";
const DRESS_CODE = "Formal";
const EVENT_DATE = new Date("2026-03-14T17:00:00-06:00");
```

## 🚀 Siguiente Paso

Una vez que tengas todos los assets listos, ejecuta:

```bash
npm run dev
```

Y abre tu navegador en `http://localhost:5173/?t=TU_TOKEN`
