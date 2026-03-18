-- ==========================================================
-- ESTRUCTURA SQL NORMALIZADA PARA SISTEMA DE BIBLIOTECA
-- CON LOGIN Y ROLES (ADMIN / USER)
-- ==========================================================

-- 1. Crear la Base de Datos
CREATE DATABASE IF NOT EXISTS sistema_biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_biblioteca;

-- 2. Tabla de Categorías (Sin dependencias)
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
) ENGINE=InnoDB;

-- 3. Tabla de Usuarios (Sistema de Login y Roles)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- IMPORTANTE: Guardar el Hash, NO contraseñas planas
    rol ENUM('admin', 'user') DEFAULT 'user' NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabla de Libros (Depende de Categorías)
CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT, -- Puede ser Nulo si no tiene categoria definida
    isbn VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL, 
    editorial VARCHAR(100),
    portada VARCHAR(255),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Préstamos (Relaciona Libros y Usuarios)
-- Mantiene la integridad referencial para evitar inconsistencias
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_libro INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NOT NULL,
    estado ENUM('Prestado', 'Devuelto', 'Atrasado') DEFAULT 'Prestado',
    -- Si el usuario o el libro tienen préstamos activos, NO SE PUEDEN ELIMINAR (RESTRICT)
    FOREIGN KEY (id_libro) REFERENCES libros(id_libro) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- INSERCIÓN DE DATOS DE PRUEBA (DATA SEEDING)
-- ==========================================================

INSERT INTO categorias (nombre, descripcion) VALUES 
('Ficción', 'Libros de imaginación pura'),
('Tecnología', 'Desarrollo web y programación');

-- Ejemplo de Hashes simulados (en producción se usan rutinas de Node.js/PHP para generar hashes como Bcrypt o Argon2)
-- Password 'admin123'
-- Password 'user123'
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
('Admin Supremo', 'admin@biblioteca.com', '$2y$10$UnHashBcryptGeneradoSimulado1234567890', 'admin'),
('Alumno Ejemplo', 'alumno@biblioteca.com', '$2y$10$OtroHashBcryptGeneradoSimulado0987654321', 'user');

INSERT INTO libros (id_categoria, isbn, titulo, autor, editorial) VALUES 
(2, '9780553293357', 'Vue.js Profesional', 'Evan You', 'Frontend Press'),
(1, '9780261102385', 'El Señor de los Anillos', 'J.R.R. Tolkien', 'Allen & Unwin');

INSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_devolucion, estado) VALUES 
(2, 2, '2023-11-01', '2023-11-15', 'Prestado');
