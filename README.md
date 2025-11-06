# Migración a Supabase - Tecnología Total SAC

Este proyecto ha sido migrado para usar PostgreSQL en Supabase como base de datos real, reemplazando el localStorage que actuaba como "base de datos" temporal.

## 📋 Pasos para configurar Supabase

### 1. Crear una cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con tu email o GitHub
4. Inicia sesión en tu cuenta

### 2. Crear un nuevo proyecto

1. En el dashboard de Supabase, haz clic en "New Project"
2. Selecciona tu organización (o crea una nueva)
3. Completa los datos del proyecto:
   - **Project Name**: `tecnologia-total-sac` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Selecciona la región más cercana a tu ubicación
4. Haz clic en "Create new project"
5. Espera unos minutos mientras se configura tu proyecto

### 3. Configurar la base de datos

1. Una vez creado el proyecto, ve a la sección **SQL Editor** en el menú lateral
2. Crea una nueva query haciendo clic en "New query"
3. Copia y pega todo el contenido del archivo `database_schema.sql` en el editor
4. Haz clic en "Run" para ejecutar el script
5. Verifica que se hayan creado las tablas correctamente

### 4. Obtener las credenciales del proyecto

1. Ve a **Settings** > **API** en el menú lateral
2. Busca la sección "Project API keys"
3. Copia los siguientes valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (una clave larga que empieza con `eyJ...`)

### 5. Configurar las credenciales en tu proyecto

1. Abre el archivo `config.js` en tu editor de código
2. Reemplaza las siguientes líneas:

   ```javascript
   const SUPABASE_URL = "TU_SUPABASE_URL_AQUI";
   const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";
   ```

   Por tus credenciales reales:

   ```javascript
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
   ```

### 6. Configurar Row Level Security (Opcional pero recomendado)

Para mayor seguridad, puedes configurar autenticación:

1. En Supabase, ve a **Authentication** > **Settings**
2. Configura los providers de autenticación que desees usar
3. Modifica las políticas de RLS en **Database** > **Policies** según tus necesidades

### 7. Probar la aplicación

1. Abre `index.html` en tu navegador
2. Verifica que aparezca el mensaje "✅ Aplicación inicializada correctamente" en la consola
3. Prueba crear un cliente, producto, garantía y orden de servicio
4. Ve a tu proyecto de Supabase > **Table Editor** para verificar que los datos se están guardando

## 🗂️ Estructura de archivos

- `config.js` - Configuración de Supabase
- `database.js` - Capa de servicio para interactuar con la base de datos
- `script-supabase.js` - Lógica principal de la aplicación con Supabase
- `database_schema.sql` - Script SQL para crear las tablas
- `script.js` - **ARCHIVO ORIGINAL** (puedes eliminarlo una vez que confirmes que todo funciona)

## 🔄 Migrar datos existentes (Si tienes datos en localStorage)

Si ya tenías datos en localStorage y quieres migrarlos:

1. Abre la consola del navegador en tu aplicación antigua
2. Ejecuta: `console.log(JSON.stringify(localStorage.getItem('servicioTecnicoData'), null, 2))`
3. Copia los datos y contacta para ayuda con el script de migración

## 🚀 Ventajas de usar Supabase

- ✅ Base de datos real PostgreSQL
- ✅ Datos persistentes y seguros
- ✅ Acceso desde múltiples dispositivos
- ✅ Backup automático
- ✅ Escalabilidad
- ✅ API REST automática
- ✅ Dashboard para administrar datos

## 🛠️ Solución de problemas

### Error: "No se pudo inicializar Supabase"

- Verifica que las credenciales en `config.js` sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error: "Cannot read properties"

- Verifica que hayas ejecutado el script SQL completo
- Revisa que todas las tablas se hayan creado correctamente

### Error de conexión

- Verifica tu conexión a internet
- Comprueba que el proyecto de Supabase no esté pausado

## 📞 Soporte

Si encuentras algún problema durante la configuración, revisa:

1. La consola del navegador para ver errores específicos
2. Los logs en el dashboard de Supabase
3. Que las credenciales estén correctamente configuradas

---

**¡Felicidades! Tu aplicación ahora usa una base de datos real. 🎉**
