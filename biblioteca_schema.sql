-- ==========================================================
-- SCRIPT DE BASE DE DATOS: BIBLIOTECA DIGITAL (Estilo E-Libro)
-- ==========================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS biblioteca_elibro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca_elibro;

-- 1. TABLA: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: usuarios (Administradores y Lectores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Guardará el HASH (password_hash)
    rol ENUM('admin', 'lector') NOT NULL DEFAULT 'lector',
    perfil_completado BOOLEAN NOT NULL DEFAULT FALSE, -- Ideal para forzar cambiar la clave
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: libros
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    categoria_id INT,
    isbn VARCHAR(20) UNIQUE,
    stock_total INT NOT NULL DEFAULT 1,
    stock_disponible INT NOT NULL DEFAULT 1,
    portada_url VARCHAR(255),
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_libro_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. TABLA: prestamos (Relaciona usuarios con libros)
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('activo', 'devuelto', 'vencido') NOT NULL DEFAULT 'activo',
    anotaciones TEXT, -- Para las herramientas de estudio estilo E-Libro
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones de Llave Foránea (Integridad Referencial)
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prestamo_libro FOREIGN KEY (libro_id) 
        REFERENCES libros(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ==========================================================
-- DATOS DE PRUEBA (Opcional)
-- ==========================================================
INSERT INTO categorias (nombre, descripcion) VALUES 
('Ingeniería', 'Libros técnicos y ciencias exactas'),
('Novela', 'Ficción y literatura');

-- El password de este admin es 'admin123' (hash generado con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol, perfil_completado) VALUES 
('Super Admin', 'admin@elibro.com', '$2y$10$eE..N7vjH1cO/2OQq/U0f.N.h/7K/3H/I/U5yq1/x8o7I3/d.aD.e', 'admin', TRUE);
