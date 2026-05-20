-- ============================================
-- ESQUEMA COMPLETO PARA VALGURUMIS
-- Base de datos: PostgreSQL
-- ============================================

-- 1. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_categoria TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PRODUCTOS (Tus muñecos)
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,  -- Para URLs amigables
    descripcion_corta VARCHAR(200),
    descripcion_larga TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    precio_oferta DECIMAL(10,2) CHECK (precio_oferta >= 0),
    imagen_principal TEXT,
    imagenes_adicionales TEXT[],  -- Array de URLs
    categoria_id INTEGER REFERENCES categorias(id),
    stock_actual INTEGER DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INTEGER DEFAULT 5,  -- Alerta cuando baja de aquí
    peso_gramos INTEGER,  -- Para calcular envíos
    material VARCHAR(100),  -- Ej: "algodón", "acrílico"
    tiempo_elaboracion_dias INTEGER DEFAULT 7,  -- Hechos a mano
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE CLIENTES
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

-- 4. TABLA DE DIRECCIONES (Múltiples direcciones por cliente)
CREATE TABLE IF NOT EXISTS direcciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    alias VARCHAR(50) DEFAULT 'Principal',  -- "Casa", "Trabajo", etc.
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

-- 5. TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,  -- Ej: "VAL-2026-0001"
    cliente_id INTEGER REFERENCES clientes(id),
    estado VARCHAR(30) DEFAULT 'pendiente',  -- pendiente, pagado, en_proceso, enviado, entregado, cancelado
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    costo_envio DECIMAL(10,2) DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    metodo_envio VARCHAR(50),
    nota_cliente TEXT,
    nota_interna TEXT,  -- Para uso del admin
    direccion_entrega_id INTEGER REFERENCES direcciones(id),
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE DETALLES DE PEDIDO
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    personalizacion TEXT,  -- Ej: "Nombre bordado: Mateo"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA DE MOVIMIENTOS DE INVENTARIO (Auditoría)
CREATE TABLE IF NOT EXISTS inventario_movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    tipo_movimiento VARCHAR(20),  -- entrada, salida, ajuste, devolución
    cantidad INTEGER NOT NULL,
    stock_antes INTEGER NOT NULL,
    stock_despues INTEGER NOT NULL,
    motivo TEXT,  -- Ej: "venta", "reposición", "devolución cliente"
    referencia_id INTEGER,  -- Puede ser pedido_id o compra_id
    usuario VARCHAR(100),  -- Quién hizo el movimiento
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA DE CARRITOS ABANDONADOS (Opcional pero útil)
CREATE TABLE IF NOT EXISTS carritos_abandonados (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    session_id VARCHAR(100),
    items JSONB,  -- Guarda el carrito completo en JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_destacado ON productos(destacado) WHERE destacado = TRUE;
CREATE INDEX idx_productos_activo ON productos(activo) WHERE activo = TRUE;
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_precio ON productos(precio);

CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);

CREATE INDEX idx_pedido_detalles_pedido ON pedido_detalles(pedido_id);
CREATE INDEX idx_pedido_detalles_producto ON pedido_detalles(producto_id);

CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_newsletter ON clientes(newsletter) WHERE newsletter = TRUE;

CREATE INDEX idx_inventario_movimientos_producto ON inventario_movimientos(producto_id);
CREATE INDEX idx_inventario_movimientos_fecha ON inventario_movimientos(created_at);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar stock automáticamente al crear un pedido
CREATE OR REPLACE FUNCTION actualizar_stock_al_pedido()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar stock del producto
    UPDATE productos 
    SET stock_actual = stock_actual - NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.producto_id;
    
    -- Registrar movimiento de inventario
    INSERT INTO inventario_movimientos (
        producto_id, tipo_movimiento, cantidad, 
        stock_antes, stock_despues, motivo, referencia_id
    )
    SELECT 
        NEW.producto_id, 'salida', NEW.cantidad,
        stock_actual + NEW.cantidad, stock_actual, 'venta', NEW.pedido_id
    FROM productos WHERE id = NEW.producto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock cuando se agrega un detalle de pedido
CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON pedido_detalles
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_al_pedido();

-- Función para actualizar totales del cliente
CREATE OR REPLACE FUNCTION actualizar_totales_cliente()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clientes
    SET 
        pedidos_totales = (
            SELECT COUNT(*) FROM pedidos 
            WHERE cliente_id = NEW.cliente_id AND estado = 'entregado'
        ),
        gasto_total = (
            SELECT COALESCE(SUM(total), 0) FROM pedidos 
            WHERE cliente_id = NEW.cliente_id AND estado = 'entregado'
        ),
        ultima_compra = (
            SELECT MAX(fecha_entrega) FROM pedidos 
            WHERE cliente_id = NEW.cliente_id AND estado = 'entregado'
        )
    WHERE id = NEW.cliente_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar cliente cuando se entrega un pedido
CREATE TRIGGER trigger_actualizar_cliente
AFTER UPDATE OF estado ON pedidos
FOR EACH ROW
WHEN (NEW.estado = 'entregado' AND OLD.estado != 'entregado')
EXECUTE FUNCTION actualizar_totales_cliente();

-- ============================================
-- DATOS DE EJEMPLO (PARA PROBAR)
-- ============================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Animales', 'Muñecos de animales adorables tejidos a mano'),
    ('Personajes', 'Personajes de cuentos y fantasía'),
    ('Personalizados', 'Muñecos hechos a tu gusto'),
    ('Accesorios', 'Llaveros, pulseras y más');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, slug, descripcion_corta, descripcion_larga, precio, imagen_principal, categoria_id, stock_actual, material, tiempo_elaboracion_dias, destacado) VALUES
    ('Conejito Rosita', 'conejito-rosita', 'Adorable conejito color rosa', 'Conejito tejido en algodón 100%, suave y perfecto para regalar. Incluye moño removible.', 320, '/productos/conejito-rosita.jpg', 1, 15, 'Algodón', 5, TRUE),
    
    ('Osito Tito', 'osito-tito', 'Osito cariñoso con corazón', 'Osito tejido con mucho amor, trae un corazón bordado en el pecho. Disponible en varios colores.', 380, '/productos/osito-tito.jpg', 1, 8, 'Acrílico suave', 7, TRUE),
    
    ('Llama Lola', 'llama-lola', 'Llama divertida y colorida', 'Una llama súper colorida que alegrará cualquier habitación. Hecha con hilos de alta calidad.', 450, '/productos/llama-lola.jpg', 1, 5, 'Hilo de algodón', 8, FALSE),
    
    ('Dragón Emilio', 'dragon-emilio', 'Dragón amigable con escamas', 'Dragón verde con alas y escamas texturizadas. Ideal para amantes de la fantasía.', 520, '/productos/dragon-emilio.jpg', 2, 3, 'Acrílico', 10, TRUE);

-- Insertar un cliente de ejemplo
INSERT INTO clientes (email, nombre, apellido, telefono, newsletter) VALUES
    ('cliente@ejemplo.com', 'María', 'González', '5512345678', TRUE);

-- Insertar dirección de ejemplo
INSERT INTO direcciones (cliente_id, alias, calle, numero, colonia, ciudad, estado, codigo_postal, es_principal) VALUES
    (1, 'Casa', 'Insurgentes', '123', 'Roma Norte', 'Ciudad de México', 'CDMX', '06700', TRUE);

-- Insertar pedido de ejemplo
INSERT INTO pedidos (numero_pedido, cliente_id, estado, subtotal, costo_envio, total, metodo_pago, metodo_envio, direccion_entrega_id) VALUES
    ('VAL-2026-0001', 1, 'entregado', 700, 50, 750, 'Tarjeta', 'Paquetería', 1);

-- Insertar detalle de pedido de ejemplo
INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario) VALUES
    (1, 1, 1, 320),
    (1, 2, 1, 380);

-- Insertar carrito abandonado de ejemplo
INSERT INTO carritos_abandonados (cliente_id, items) VALUES
    (1, '[{"producto_id": 3, "nombre": "Llama Lola", "cantidad": 1, "precio": 450}]');
