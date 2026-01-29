document.addEventListener("DOMContentLoaded", () => {
    frmLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        validarLogin();
    });
    
    frmRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        registrarUsuario();
    });
});

function toggleForm() {
    let loginSection = document.getElementById("loginSection");
    let registroSection = document.getElementById("registroSection");
    
    loginSection.classList.toggle("active");
    registroSection.classList.toggle("active");
    
    // Limpiar mensajes y formularios
    document.getElementById("frmLogin").reset();
    document.getElementById("frmRegistro").reset();
    document.getElementById("loginError").style.display = "none";
    document.getElementById("registroError").style.display = "none";
    document.getElementById("registroSuccess").style.display = "none";
}

function validarLogin() {
    let usuario = document.getElementById("txtLoginUsuario").value.trim();
    let password = document.getElementById("txtLoginPassword").value.trim();
    let loginError = document.getElementById("loginError");

    // Obtener usuarios del localStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if(usuarios[usuario] && usuarios[usuario] === password) {
        // Login exitoso
        sessionStorage.setItem("usuarioLoggeado", usuario);
        window.location.href = "index.html";
    } else {
        // Login fallido
        loginError.textContent = "Usuario o contraseña incorrectos";
        loginError.style.display = "block";
        document.getElementById("txtLoginPassword").value = "";
        document.getElementById("txtLoginPassword").focus();
    }
}

function registrarUsuario() {
    let usuario = document.getElementById("txtRegistroUsuario").value.trim();
    let password = document.getElementById("txtRegistroPassword").value.trim();
    let passwordConfirm = document.getElementById("txtRegistroPasswordConfirm").value.trim();
    let registroError = document.getElementById("registroError");
    let registroSuccess = document.getElementById("registroSuccess");
    
    // Limpiar mensajes
    registroError.style.display = "none";
    registroSuccess.style.display = "none";
    
    // Validaciones
    if(usuario.length < 3) {
        registroError.textContent = "El usuario debe tener al menos 3 caracteres";
        registroError.style.display = "block";
        return;
    }
    
    if(password.length < 4) {
        registroError.textContent = "La contraseña debe tener al menos 4 caracteres";
        registroError.style.display = "block";
        return;
    }
    
    if(password !== passwordConfirm) {
        registroError.textContent = "Las contraseñas no coinciden";
        registroError.style.display = "block";
        return;
    }
    
    // Verificar si el usuario ya existe
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
    
    if(usuarios[usuario]) {
        registroError.textContent = "Este usuario ya está registrado";
        registroError.style.display = "block";
        return;
    }
    
    // Registrar nuevo usuario
    usuarios[usuario] = password;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    // Mostrar mensaje de éxito
    registroSuccess.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión";
    registroSuccess.style.display = "block";
    
    // Limpiar formulario
    document.getElementById("frmRegistro").reset();
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
        toggleForm();
    }, 2000);
}
