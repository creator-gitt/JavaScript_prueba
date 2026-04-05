<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida - Laravel</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #6366f1; --secondary: #a855f7; --background: #0f172a; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        body { background: radial-gradient(circle at top left, #1e293b, #0f172a); color: #fff; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 3rem; text-align: center; max-width: 600px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        h1 { font-size: 3rem; font-weight: 600; margin-bottom: 1rem; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; }
        .btn { display: inline-block; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; text-decoration: none; padding: 1rem 2.5rem; border-radius: 12px; font-weight: 600; transition: all 0.3s ease; }
    </style>
</head>
<body>
    <div class="glass-card">
        <img src="{{ asset('School.png') }}" alt="School Logo" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 1.5rem;">
        <h1>¡Ahora sí funciona!</h1>
        <p>El error de "View not found" era porque habías borrado este archivo. Lo he restaurado para ti.</p>
        <a href="#" class="btn">Continuar</a>
    </div>
</body>
</html>
