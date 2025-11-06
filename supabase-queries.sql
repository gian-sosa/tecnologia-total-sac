-- Comandos útiles para el SQL Editor de Supabase

-- 1. Verificar que las tablas se crearon correctamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver la estructura de una tabla específica
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- 3. Contar registros en cada tabla
SELECT 
  'clientes' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 
  'productos' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 
  'garantias' as tabla, COUNT(*) as total FROM garantias
UNION ALL
SELECT 
  'ordenes' as tabla, COUNT(*) as total FROM ordenes;

-- 4. Ver los últimos registros creados
SELECT 'clientes' as tabla, nombres, apellidos, created_at
FROM clientes
ORDER BY created_at DESC
LIMIT 5;

-- 5. Ver órdenes con información completa
SELECT 
  o.num_orden,
  o.estado,
  p.marca,
  p.modelo,
  p.num_serie,
  c.nombres,
  c.apellidos,
  o.created_at
FROM ordenes o
JOIN productos p ON o.producto_id = p.id
JOIN clientes c ON p.cliente_id = c.id
ORDER BY o.created_at DESC;

-- 6. Limpiar todas las tablas (¡CUIDADO! Esto borra todos los datos)
-- TRUNCATE TABLE ordenes CASCADE;
-- TRUNCATE TABLE garantias CASCADE;
-- TRUNCATE TABLE productos CASCADE;
-- TRUNCATE TABLE clientes CASCADE;

-- 7. Resetear la secuencia del contador de órdenes
-- ALTER SEQUENCE orden_counter_seq RESTART WITH 1;

-- 8. Ver garantías vigentes
SELECT 
  g.*,
  p.marca,
  p.modelo,
  c.nombres,
  c.apellidos
FROM garantias g
JOIN productos p ON g.producto_id = p.id
JOIN clientes c ON p.cliente_id = c.id
WHERE g.fecha_fin >= CURRENT_DATE;

-- 9. Ver estadísticas rápidas
SELECT 
  COUNT(CASE WHEN o.estado != 'Entregado' THEN 1 END) as ordenes_activas,
  COUNT(CASE WHEN o.estado = 'En Diagnóstico' THEN 1 END) as en_diagnostico,
  COUNT(CASE WHEN o.estado = 'En Reparación' THEN 1 END) as en_reparacion,
  COUNT(CASE WHEN g.fecha_fin >= CURRENT_DATE THEN 1 END) as garantias_vigentes
FROM ordenes o
FULL OUTER JOIN (
  SELECT g.*, p.id as producto_id
  FROM garantias g
  JOIN productos p ON g.producto_id = p.id
) g ON TRUE;

-- 10. Ejemplo de inserción manual de datos de prueba
INSERT INTO clientes (tipo_doc, num_doc, nombres, apellidos, telefono, email, direccion) 
VALUES 
  ('DNI', '12345678', 'Juan', 'Pérez', '987654321', 'juan@email.com', 'Av. Principal 123'),
  ('DNI', '87654321', 'María', 'García', '987654322', 'maria@email.com', 'Jr. Secundario 456');

-- Luego insertar productos para estos clientes
INSERT INTO productos (cliente_id, tipo_comprobante, num_comprobante, fecha_compra, categoria, marca, modelo, num_serie, descripcion)
SELECT 
  c.id,
  'Factura',
  'F001-0001',
  CURRENT_DATE - INTERVAL '30 days',
  'Laptop',
  'HP',
  'Pavilion 15',
  'HP123456',
  'Laptop HP Pavilion 15 para uso corporativo'
FROM clientes c 
WHERE c.num_doc = '12345678';

-- Verificar datos insertados
SELECT 
  c.nombres,
  c.apellidos,
  p.marca,
  p.modelo,
  p.num_serie
FROM clientes c
JOIN productos p ON c.id = p.cliente_id;