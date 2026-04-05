import alumnos from './componentes/alumnos.js';
import busqueda_alumnos from './componentes/busqueda_alumnos.js';
import materias from './componentes/materias.js';
import busqueda_materias from './componentes/busqueda_materias.js';
import docentes from './componentes/docentes.js';
import busqueda_docentes from './componentes/busqueda_docentes.js';
import matriculas from './componentes/matriculas.js';
import busqueda_matriculas from './componentes/busqueda_matriculas.js';
import inscripciones from './componentes/inscripciones.js';
import busqueda_inscripciones from './componentes/busqueda_inscripciones.js';

const { createApp } = Vue;
window.sha256 = CryptoJS.SHA256;

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Inicialización] DOM cargado. Preparando Delegación Global.');

    /* -----------------------------------------------------
       1. INICIALIZAR EL MODO OSCURO (Lectura de LocalStorage)
       ----------------------------------------------------- */
    const htmlElement = document.documentElement;
    
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            htmlElement.setAttribute('data-bs-theme', 'dark');
            
            // Si Vue aún no monta el ícono no importa, lo busca si ya existe.
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
                themeIcon.classList.add('text-warning');
            }
        }
    } catch (error) {
        console.error('Error cargando inicial el tema:', error);
    }
});

/* -----------------------------------------------------
   2. EL SECRETO: EVENT DELEGATION GLOBAL
   Como Vue.js reconstruye el <div id="app"> al montarse, todos los 
   listeners ("addEventListener") atados a los botones mueren.
   Escuchamos directo al documento, que NUNCA muere.
   ----------------------------------------------------- */
document.addEventListener('click', function(e) {

    // === NAVEGACIÓN SPA ===
    const navLink = e.target.closest('.btn-nav-spa');
    if (navLink) {
        e.preventDefault(); 
        console.log('[SPA] Link interceptado mediante delegación global.');
        
        const targetId = navLink.getAttribute('data-target');
        
        // 1. Ocultar todos los formularios activos en el DOM reestructurado
        document.querySelectorAll('.modulo-seccion').forEach(function(section) {
            section.classList.add('d-none');
        });
        
        // 2. Mostrar destino
        if (targetId) {
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('d-none');
                console.log(`[SPA] Módulo ${targetId} Abierto con Éxito`);
            } else {
                console.error(`[SPA Error] Se intentó abrir id="${targetId}" pero el DOM (Vue) no lo tiene.`);
            }
        }
        return; // Detenemos la cadena de clics aquí
    }

    // === BOTÓN DE MODO OSCURO ===
    const btnDarkMode = e.target.closest('#themeToggle');
    if (btnDarkMode) {
        e.preventDefault();
        console.log('[Dark Mode] Botón interceptado mediante delegación global.');
        
        const htmlElement = document.documentElement;
        const themeIcon = document.getElementById('themeIcon');
        const isCurrentDark = htmlElement.getAttribute('data-theme') === 'dark';

        if (isCurrentDark) { // Apagar Oscuro
            htmlElement.removeAttribute('data-theme');
            htmlElement.removeAttribute('data-bs-theme');
            localStorage.setItem('theme', 'light');
            
            if (themeIcon) {
                themeIcon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
                themeIcon.classList.remove('text-warning');
            }
        } else { // Encender Oscuro
            htmlElement.setAttribute('data-theme', 'dark');
            htmlElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            
            if (themeIcon) {
                themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
                themeIcon.classList.add('text-warning');
            }
        }
    }

    // === BOTÓN DE OCULTAR/MOSTRAR SIDEBAR ===
    const btnSidebar = e.target.closest('#sidebarToggle');
    if (btnSidebar) {
        e.preventDefault();
        console.log('[Sidebar] Alternando visibilidad (Colapso)');
        document.body.classList.toggle('sidebar-collapsed');
    }
});


createApp({
    components:{
        alumnos,
        busqueda_alumnos,
        materias,
        busqueda_materias,
        docentes,
        busqueda_docentes,
        matriculas,
        busqueda_matriculas,
        inscripciones,
        busqueda_inscripciones
    },
    data(){
        return{
            forms:{
                alumnos:{mostrar:false},
                busqueda_alumnos:{mostrar:false},
                materias:{mostrar:false},
                busqueda_materias:{mostrar:false},
                docentes:{mostrar:false},
                busqueda_docentes:{mostrar:false},
                matriculas:{mostrar:false},
                busqueda_matriculas:{mostrar:false},
                inscripciones:{mostrar:false},
                busqueda_inscripciones:{mostrar:false}
            }
        }
    },
    computed: {
        anyFormActive() {
            return Object.values(this.forms).some(f => f.mostrar);
        }
    },
    methods:{
        buscar(ventana, metodo){
            this.$refs[ventana][metodo]();
        },
        abrirVentana(ventana){
            // Comportamiento SPA: Ocultar todas las ventanas primero
            for (const key in this.forms) {
                this.forms[key].mostrar = false;
            }
            // Mostrar únicamente el módulo solicitado
            this.forms[ventana].mostrar = true;
        },
        volverInicio() {
            // Ocultar todos los formularios para volver a ver el Dashboard (Inicio)
            for (const key in this.forms) {
                this.forms[key].mostrar = false;
            }
        },
        modificar(ventana, metodo, data){
            this.$refs[ventana][metodo](data);
        }
    }
}).mount("#app");
