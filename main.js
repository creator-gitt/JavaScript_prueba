document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario está loggeado
    if(!sessionStorage.getItem("usuarioLoggeado")) {
        window.location.href = "Login.html";
        return;
    }
    
    frmAlumnos.addEventListener("submit", (e) => {
        e.preventDefault();
       guardarAlumno();
    });
    mostrarAlumnos();
});
function mostrarAlumnos(){
    let $tblAlumnos = document.querySelector("#tblAlumnos tbody"),
        n = localStorage.length,
        filas = "";
    $tblAlumnos.innerHTML = "";
    for(let i=0; i<n; i++){
        let key = localStorage.key(i),
            data = JSON.parse(localStorage.getItem(key));
        filas += `
                <tr onclick='modificarAlumno(${JSON.stringify(data)})'>
                    <td>${data.codigo}</td>
                    <td>${data.nombre}</td>
                    <td>${data.direccion}</td>
                    <td>${data.email}</td>
                    <td>${data.telefono}</td>
                    <td>
                        <button type="button" class="btn btn-mod" onclick='modificarAlumno(${JSON.stringify(data)})'>MOD</button>
                        <button type="button" class="btn btn-del" onclick='eliminarAlumno(${JSON.stringify(data)})'>DEL</button>
                    </td>
                </tr>
            `;
    }
    $tblAlumnos.innerHTML = filas;
}
function modificarAlumno(alumno){
    txtCodigoAlumno.value = alumno.codigo;
    txtnombreAlumno.value = alumno.nombre;
    txtDireccionAlumno.value = alumno.direccion;
    txtEmailAlumno.value = alumno.email;
    txtTelefonoAlumno.value = alumno.telefono;
    txtCodigoAlumno.disabled = true; // Deshabilitar código para que no se pueda cambiar
}

function eliminarAlumno(alumno){
    if(confirm("¿Deseas eliminar al alumno " + alumno.nombre + "?")){
        let id = "1"; // Buscar el ID correcto
        for(let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i);
            let datos = JSON.parse(localStorage.getItem(key));
            if(datos.codigo === alumno.codigo){
                id = key;
                break;
            }
        }
        localStorage.removeItem(id);
        mostrarAlumnos();
        limpiarFormulario();
    }
}
function guardarAlumno() {
    let esEdicion = txtCodigoAlumno.disabled; // Detectar si estamos en modo edición
    let datos = {
        codigo: txtCodigoAlumno.value,
        nombre: txtnombreAlumno.value,
        direccion: txtDireccionAlumno.value,
        email: txtEmailAlumno.value,
        telefono: txtTelefonoAlumno.value
    };
    
    if(esEdicion){
        // Modo edición: buscar y actualizar el registro existente
        let idAEliminar = null;
        for(let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i);
            let alumnoGuardado = JSON.parse(localStorage.getItem(key));
            if(alumnoGuardado.codigo === datos.codigo){
                idAEliminar = key;
                break;
            }
        }
        if(idAEliminar){
            localStorage.removeItem(idAEliminar);
            datos.id = idAEliminar; // Mantener el mismo ID
        }
    } else {
        // Modo nuevo: verificar que no exista
        let codigoDuplicado = buscarAlumno(datos.codigo);
        if(codigoDuplicado){
            alert("El codigo del alumno ya existe, "+ codigoDuplicado.nombre);
            return;
        }
        datos.id = getId();
    }
    
    localStorage.setItem(datos.id, JSON.stringify(datos));
    limpiarFormulario();
}

function getId(){
    return localStorage.length + 1;
}

function limpiarFormulario(){
    frmAlumnos.reset();
    txtCodigoAlumno.disabled = false; // Habilitar el código para nuevos registros
}

function buscarAlumno(codigo=''){
    let n = localStorage.length;
    for(let i = 0; i < n; i++){
        let key = localStorage.key(i);
        let datos = JSON.parse(localStorage.getItem(key));
        if(datos?.codigo && datos.codigo.trim().toUpperCase() == codigo.trim().toUpperCase()){
            return datos;
        }
    }
    return null;
}

function cerrarSesion(){
    sessionStorage.removeItem("usuarioLoggeado");
    window.location.href = "Login.html";
}