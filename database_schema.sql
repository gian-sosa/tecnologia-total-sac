-- Script SQL para crear las tablas necesarias en PostgreSQL (Supabase)
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- 1. Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    tipo_doc VARCHAR(20) NOT NULL,
    num_doc VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo_comprobante VARCHAR(50) NOT NULL,
    num_comprobante VARCHAR(100) NOT NULL,
    fecha_compra DATE NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    num_serie VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de garantías
CREATE TABLE IF NOT EXISTS garantias (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    duracion_meses INTEGER NOT NULL,
    terminos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de órdenes de servicio
CREATE TABLE IF NOT EXISTS ordenes (
    id BIGSERIAL PRIMARY KEY,
    num_orden VARCHAR(20) NOT NULL UNIQUE,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Recibido',
    prioridad VARCHAR(20) NOT NULL DEFAULT 'Media',
    problema_reportado TEXT,
    diagnostico TEXT,
    reparacion TEXT,
    repuestos TEXT,
    costo_repuestos DECIMAL(10,2) DEFAULT 0,
    costo_mano DECIMAL(10,2) DEFAULT 0,
    tiempo_atencion INTEGER DEFAULT 0,
    historial JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_num_doc ON clientes(num_doc);
CREATE INDEX IF NOT EXISTS idx_productos_num_serie ON productos(num_serie);
CREATE INDEX IF NOT EXISTS idx_productos_cliente_id ON productos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_garantias_producto_id ON garantias(producto_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_producto_id ON ordenes(producto_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_num_orden ON ordenes(num_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);

-- 6. Crear funciones para actualizar el timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_garantias_updated_at ON garantias;
CREATE TRIGGER update_garantias_updated_at
    BEFORE UPDATE ON garantias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_ordenes_updated_at ON ordenes;
CREATE TRIGGER update_ordenes_updated_at
    BEFORE UPDATE ON ordenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 8. Crear una secuencia para el contador de órdenes
CREATE SEQUENCE IF NOT EXISTS orden_counter_seq START WITH 1;

-- 9. Habilitar Row Level Security (RLS) - Opcional pero recomendado
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas básicas (permite todo para usuarios autenticados)
-- Puedes modificar estas políticas según tus necesidades de seguridad
CREATE POLICY "Enable all operations for authenticated users" ON clientes
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON productos
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON garantias
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON ordenes
    FOR ALL USING (true);

-- 11. Comentarios para documentación
COMMENT ON TABLE clientes IS 'Tabla para almacenar información de clientes';
COMMENT ON TABLE productos IS 'Tabla para almacenar productos de los clientes';
COMMENT ON TABLE garantias IS 'Tabla para almacenar garantías de productos';
COMMENT ON TABLE ordenes IS 'Tabla para almacenar órdenes de servicio técnico';

-- Insertar algunos datos de prueba (opcional)
-- INSERT INTO clientes (tipo_doc, num_doc, nombres, apellidos, telefono, email, direccion) 
-- VALUES ('DNI', '12345678', 'Juan', 'Pérez', '987654321', 'juan@email.com', 'Av. Principal 123');