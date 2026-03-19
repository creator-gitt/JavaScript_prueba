<?php
// api/usuarios.php
require 'config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, nombre, email, rol, perfil_completado, fecha_registro FROM usuarios ORDER BY nombre ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        // Simulando que el admin crea al usuario: la contraseña es el DNI o email por defecto
        $password = password_hash($data->email, PASSWORD_DEFAULT); 
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->nombre, $data->email, $password, 'lector']);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $pdo->prepare("UPDATE usuarios SET nombre=?, email=? WHERE id=?");
        $stmt->execute([$data->nombre, $data->email, $data->id]);
        echo json_encode(["success" => true]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
        break;
}
?>
