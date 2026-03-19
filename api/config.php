<?php
// api/config.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de peticiones preflight CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

$host = 'localhost';
$db = 'biblioteca_elibro';
$user = 'root'; // Usuario por defecto de XAMPP
$pass = '';     // Contraseña por defecto de XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    // Habilitar el reporte de errores de PDO (muy útil para debugging)
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error crítico: No se pudo conectar a la base de datos."]);
    exit;
}
?>
