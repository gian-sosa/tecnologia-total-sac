// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tu configuración real de Supabase
const SUPABASE_URL = "https://rcebzvfuilkuwtejjpjz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZWJ6dmZ1aWxrdXd0ZWpqcGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTE1ODMsImV4cCI6MjA3Nzk2NzU4M30.w_GDybWb8B7wXkA-LcU4RQQK-PV8XokLy9u7K9hJt8U";

// Inicializar cliente de Supabase
let supabase;

// Inicializar Supabase cuando se cargue la biblioteca
function initializeSupabase() {
  if (typeof supabase === "undefined" && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase inicializado correctamente");
  }
}

// Verificar que las credenciales estén configuradas
function validateSupabaseConfig() {
  if (
    SUPABASE_URL === "TU_SUPABASE_URL_AQUI" ||
    SUPABASE_ANON_KEY === "TU_SUPABASE_ANON_KEY_AQUI" ||
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY
  ) {
    console.error(
      "⚠️ CONFIGURACIÓN REQUERIDA: Debes configurar tu URL y clave de Supabase en config.js"
    );
    alert(
      "Por favor configura las credenciales de Supabase en el archivo config.js"
    );
    return false;
  }
  return true;
}
