-- ============================================
-- SCRIPT PARA AGREGAR TABLAS FALTANTES
-- Y MODIFICAR TABLAS EXISTENTES
-- ============================================

-- ============================================
-- 1. MODIFICAR TABLA 'productos' (agregar columnas faltantes)
-- ============================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS slug VARCHAR(120) UNIQUE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion_corta VARCHAR(200);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion_larga TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_oferta DECIMAL(10,2) CHECK (precio_oferta >= 0);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagenes_adicionales TEXT[];
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id INTEGER;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 5;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS peso_gramos INTEGER;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS material VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tiempo_elaboracion_dias INTEGER DEFAULT 7;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Actualizar slugs para productos existentes (si no tienen)
UPDATE productos SET slug = LOWER(REPLACE(nombre, ' ', '-')) WHERE slug IS NULL;

-- ============================================
-- 2. MODIFICAR TABLA 'pedidos' (agregar columnas faltantes)
-- ============================================

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_pedido VARCHAR(20) UNIQUE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS descuento DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago_id VARCHAR(100);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_envio VARCHAR(50);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nota_cliente TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nota_interna TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_entrega_id INTEGER;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Generar números de pedido para existentes (si no tienen)
UPDATE pedidos SET numero_pedido = 'VAL-2026-' || LPAD(id::TEXT, 4, '0') WHERE numero_pedido IS NULL;

-- ============================================
-- 3. MODIFICAR TABLA 'pedido_detalles' (agregar columnas faltantes)
-- ============================================

ALTER TABLE pedido_detalles ADD COLUMN IF NOT EXISTS personalizacion TEXT;
ALTER TABLE pedido_detalles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 4. CREAR TABLA 'categorias'
-- ============================================

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_categoria TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. CREAR TABLA 'clientes'
-- ============================================

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    newsletter BOOLEAN DEFAULT FALSE,
    pedidos_totales INTEGER DEFAULT 0,
    gasto_total DECIMAL(10,2) DEFAULT 0,
    ultima_compra TIMESTAMP
);

-- ============================================
-- 6. CREAR TABLA 'direcciones'
-- ============================================

CREATE TABLE IF NOT EXISTS direcciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    alias VARCHAR(50) DEFAULT 'Principal',
    calle VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    colonia VARCHAR(100),
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(50) DEFAULT 'México',
    referencias TEXT,
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. CREAR TABLA 'pagos'
-- ============================================

CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pendiente',
    payment_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. CREAR TABLA 'inventario_movimientos'
-- ============================================

CREATE TABLE IF NOT EXISTS inventario_movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(20) NOT NULL,
    cantidad INTEGER NOT NULL,
    stock_antes INTEGER NOT NULL,
    stock_despues INTEGER NOT NULL,
    motivo TEXT,
    referencia_id INTEGER,
    usuario VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. CREAR TABLA 'carritos_abandonados'
-- ============================================

CREATE TABLE IF NOT EXISTS carritos_abandonados (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. CREAR RELACIÓN categoria_id con categorias
-- ============================================

-- Agregar foreign key si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'productos_categoria_id_fkey'
    ) THEN
        ALTER TABLE productos 
        ADD CONSTRAINT productos_categoria_id_fkey 
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 11. CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado) WHERE destacado = TRUE;
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_productos_slug ON productos(slug);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);

CREATE INDEX IF NOT EXISTS idx_pedido_detalles_pedido ON pedido_detalles(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_detalles_producto ON pedido_detalles(producto_id);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_newsletter ON clientes(newsletter) WHERE newsletter = TRUE;

CREATE INDEX IF NOT EXISTS idx_pagos_pedido ON pagos(pedido_id);

-- ============================================
-- 12. FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para productos
DROP TRIGGER IF EXISTS trigger_update_productos_updated_at ON productos;
CREATE TRIGGER trigger_update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para pedidos
DROP TRIGGER IF EXISTS trigger_update_pedidos_updated_at ON pedidos;
CREATE TRIGGER trigger_update_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. FUNCIÓN PARA ACTUALIZAR STOCK
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_stock_al_pedido()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INTEGER;
BEGIN
    SELECT stock_actual INTO v_stock_actual
    FROM productos WHERE id = NEW.producto_id;
    
    IF v_stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para producto ID %', NEW.producto_id;
    END IF;
    
    UPDATE productos 
    SET stock_actual = stock_actual - NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.producto_id;
    
    INSERT INTO inventario_movimientos (
        producto_id, tipo_movimiento, cantidad, 
        stock_antes, stock_despues, motivo, referencia_id, usuario
    )
    SELECT 
        NEW.producto_id, 'salida', NEW.cantidad,
        v_stock_actual, v_stock_actual - NEW.cantidad, 'venta', NEW.pedido_id, 'sistema';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para stock
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON pedido_detalles;
CREATE TRIGGER trigger_actualizar_stock
    AFTER INSERT ON pedido_detalles
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_al_pedido();

-- ============================================
-- 14. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Animales', 'Muñecos de animales adorables tejidos a mano'),
    ('Personajes', 'Personajes de cuentos y fantasía'),
    ('Personalizados', 'Muñecos hechos a tu gusto'),
    ('Accesorios', 'Llaveros, pulseras y más')
ON CONFLICT (nombre) DO NOTHING;