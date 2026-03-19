<?php
// api/login.php
require 'config.php';

// Obtener los datos JSON que enviará Vue.js
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Por favor, ingresa correo y contraseña."]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, nombre, password, rol, perfil_completado FROM usuarios WHERE email = ? LIMIT 1");
$stmt->execute([$data->email]);
$user = $stmt->fetch();

// password_verify() compara la clave en texto plano con el HASH guardado en la BD
if ($user && password_verify($data->password, $user['password'])) {
    
    // NUNCA devolvemos la contraseña al front-end
    unset($user['password']); 
    
    // Generar un token simple (En producción se recomienda JWT - JSON Web Tokens)
    $token = bin2hex(random_bytes(32)); 
    
    echo json_encode([
        "success" => true,
        "token" => $token,
        "usuario" => $user
    ]);
} else {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Credenciales incorrectas, intenta nuevamente."]);
}
?>
