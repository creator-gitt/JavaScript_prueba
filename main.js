import { createApp, ref, computed, onMounted, watch } from 'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js';
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs';

const db = new Dexie('db_usss017224_jonathan_guandique');

db.version(4).stores({
    categorias: '++idCategoria, nombre, descripcion',
    autor: '++idAutor, codigo, nombre, pais, telefono',
    libros: '++idLibro, idAutor, idCategoria, isbn, titulo, editorial, edicion, portada',
    usuarios: '++idUsuario, documento, nombre, email, telefono',
    prestamos: '++idPrestamo, idLibro, idUsuario, fechaPrestamo, fechaDevolucion, estado'
});

const App = {
    setup() {
        // --- FIX DE PERSISTENCIA ---
        // Solicitar al navegador que no borre los datos de IndexedDB por falta de espacio
        const checkStoragePersistence = async () => {
            if (navigator.storage && navigator.storage.persist) {
                const granted = await navigator.storage.persist();
                console.log(granted ? "Almacenamiento persistente concedido." : "Almacenamiento persistente denegado.");
            }
        };
        checkStoragePersistence();
        // ---------------------------

        const sidebarVisible = ref(false);
        const windowWidth = ref(window.innerWidth);
        const darkMode = ref(localStorage.getItem('theme') === 'dark');
        
        // --- SIMULACIÓN DE SESIÓN (eLibro) ---
        const simuladorLoginId = ref('admin'); // 'admin' o idUsuario
        const rolActual = computed(() => simuladorLoginId.value === 'admin' ? 'admin' : 'lector');
        
        const cambiarSesion = () => {
            if (rolActual.value === 'lector') {
                currentTab.value = 'catalogo'; // Kiosco
            } else {
                currentTab.value = 'dashboard';
            }
        };

        const misPrestamos = computed(() => {
            if (rolActual.value !== 'lector') return [];
            return prestamos.value.filter(p => p.idUsuario === simuladorLoginId.value && p.estado === 'Prestado');
        });

        const autoPrestamo = async (idLibro) => {
            const libroOcupado = prestamos.value.find(p => p.idLibro === idLibro && p.estado === 'Prestado');
            if (libroOcupado) {
                alertify.error('Este libro ya está prestado.');
                return;
            }
            
            // Setear a 7 dias por defecto de eLibro
            const hoy = new Date();
            const fechaPrestamo = hoy.toISOString().split('T')[0];
            const devolucionDate = new Date();
            devolucionDate.setDate(hoy.getDate() + 7);
            const fechaDevolucion = devolucionDate.toISOString().split('T')[0];

            isSaving.value = true;
            try {
                await db.prestamos.add({
                    idLibro: idLibro,
                    idUsuario: simuladorLoginId.value,
                    fechaPrestamo: fechaPrestamo,
                    fechaDevolucion: fechaDevolucion,
                    estado: 'Prestado'
                });
                await cargarPrestamos();
                currentTab.value = 'estante';
                alertify.success('Libro añadido a tu estante virtual con éxito.');
            } catch (error) {
                alertify.error('Error al realizar auto-préstamo');
            } finally {
                setTimeout(() => isSaving.value = false, 500);
            }
        };
        // -------------------------------------

        const applyTheme = () => {
            document.documentElement.setAttribute('data-bs-theme', darkMode.value ? 'dark' : 'light');
            localStorage.setItem('theme', darkMode.value ? 'dark' : 'light');
        };
        applyTheme();

        const toggleDarkMode = () => {
            darkMode.value = !darkMode.value;
            applyTheme();
        };
        
        window.addEventListener('resize', () => {
            windowWidth.value = window.innerWidth;
        });

        const currentTab = ref('dashboard');

        // --- LÓGICA DE CATEGORÍAS ---
        const categorias = ref([]);
        const editModeCategoria = ref(false);
        const formCategoria = ref({ idCategoria: null, nombre: '', descripcion: '' });

        const cargarCategorias = async () => {
            categorias.value = await db.categorias.toArray();
        };

        const guardarCategoria = async () => {
            isSaving.value = true;
            try {
                const { idCategoria, ...data } = formCategoria.value;
                if (editModeCategoria.value) {
                    await db.categorias.update(idCategoria, data);
                    alertify.success('Categoría actualizada');
                } else {
                    await db.categorias.add(data);
                    alertify.success('Categoría guardada');
                }
                await cargarCategorias();
                cancelarEdicionCategoria();
            } catch (error) {
                alertify.error('Error al guardar categoría');
            } finally {
                setTimeout(() => isSaving.value = false, 500);
            }
        };

        const editarCategoria = (cat) => {
            formCategoria.value = { ...cat };
            editModeCategoria.value = true;
        };

        const eliminarCategoria = async (id) => {
            alertify.confirm('Eliminar Categoría', '¿Eliminar esta categoría?', 
                async () => {
                    await db.categorias.delete(id);
                    await cargarCategorias();
                    alertify.success('Eliminada');
                }, null
            );
        };

        const cancelarEdicionCategoria = () => {
            formCategoria.value = { idCategoria: null, nombre: '', descripcion: '' };
            editModeCategoria.value = false;
        };

        // -----------------------------

        const autores = ref([]);
        const filtroAutor = ref('');
        const editModeAutor = ref(false);
        const formAutor = ref({ idAutor: null, codigo: '', nombre: '', pais: '', telefono: '' });
        const isSaving = ref(false);
        const isSearching = ref(false);
        const isbnError = ref('');

        // --- SISTEMA DE ANOTACIONES ESTANTE ---
        const guardarAnotacion = async (idPrestamo, nota) => {
            // Guardaremos la nota en el registro de prestamo para simplificar la persistencia
            await db.prestamos.update(idPrestamo, { anotaciones: nota });
            await cargarPrestamos();
            alertify.success('Anotación guardada en tu estante.');
        };
        // --------------------------------------

        const cargarAutores = async () => {
            autores.value = await db.autor.toArray();
        };

        // Configuración global de Alertify
        alertify.set('notifier', 'position', 'bottom-right');
        alertify.defaults.theme.ok = 'btn btn-primary';
        alertify.defaults.theme.cancel = 'btn btn-danger';
        alertify.defaults.theme.input = 'form-control';

        const guardarAutor = async () => {
            isSaving.value = true;
            try {
                const { idAutor, ...data } = formAutor.value;
                if (editModeAutor.value) {
                    await db.autor.update(idAutor, data);
                    alertify.success('Autor actualizado con éxito');
                } else {
                    await db.autor.add(data);
                    alertify.success('Autor guardado con éxito');
                }
                await cargarAutores();
                cancelarEdicionAutor();
            } catch (error) {
                alertify.error('Error al guardar el autor');
            } finally {
                setTimeout(() => {
                    isSaving.value = false;
                }, 500);
            }
        };

        const editarAutor = (autor) => {
            formAutor.value = { ...autor };
            editModeAutor.value = true;
        };

        const eliminarAutor = async (id) => {
            alertify.confirm('Confirmar eliminación', '¿Estás seguro de eliminar este autor?', 
                async () => {
                    await db.autor.delete(id);
                    await cargarAutores();
                    alertify.success('Autor eliminado correctamente');
                }, 
                () => {
                    alertify.error('Operación cancelada');
                }
            ).set('labels', {ok:'Si, eliminar', cancel:'Cancelar'});
        };

        const cancelarEdicionAutor = () => {
            formAutor.value = { idAutor: null, codigo: '', nombre: '', pais: '', telefono: '' };
            editModeAutor.value = false;
        };

        const autoresFiltrados = computed(() => {
            const qr = filtroAutor.value.toLowerCase().trim();
            if (!qr) return autores.value;
            return autores.value.filter(a => 
                a.nombre.toLowerCase().includes(qr) ||
                a.codigo.toLowerCase().includes(qr) ||
                a.pais.toLowerCase().includes(qr)
            );
        });

        // --- LÓGICA DE USUARIOS (LECTORES) ---
        const usuarios = ref([]);
        const filtroUsuario = ref('');
        const editModeUsuario = ref(false);
        const formUsuario = ref({ idUsuario: null, documento: '', nombre: '', email: '', telefono: '' });

        const cargarUsuarios = async () => {
            usuarios.value = await db.usuarios.toArray();
        };

        const guardarUsuario = async () => {
            isSaving.value = true;
            try {
                const { idUsuario, ...data } = formUsuario.value;
                if (editModeUsuario.value) {
                    await db.usuarios.update(idUsuario, data);
                    alertify.success('Usuario actualizado');
                } else {
                    await db.usuarios.add(data);
                    alertify.success('Usuario registrado');
                }
                await cargarUsuarios();
                cancelarEdicionUsuario();
            } catch (error) {
                alertify.error('Error al guardar el usuario');
            } finally {
                setTimeout(() => isSaving.value = false, 500);
            }
        };

        const editarUsuario = (user) => {
            formUsuario.value = { ...user };
            editModeUsuario.value = true;
        };

        const eliminarUsuario = async (id) => {
            alertify.confirm('Eliminar Lector', '¿Eliminar este lector permanentemente?', 
                async () => {
                    await db.usuarios.delete(id);
                    await cargarUsuarios();
                    alertify.success('Lector eliminado');
                }, null
            );
        };

        const cancelarEdicionUsuario = () => {
            formUsuario.value = { idUsuario: null, documento: '', nombre: '', email: '', telefono: '' };
            editModeUsuario.value = false;
        };

        const usuariosFiltrados = computed(() => {
            const qr = filtroUsuario.value.toLowerCase().trim();
            if (!qr) return usuarios.value;
            return usuarios.value.filter(u => 
                u.nombre.toLowerCase().includes(qr) ||
                u.documento.toLowerCase().includes(qr)
            );
        });

        // -----------------------------

        const libros = ref([]);
        const filtroLibro = ref('');
        const editModeLibro = ref(false);
        const formLibro = ref({ idLibro: null, idAutor: '', idCategoria: '', isbn: '', titulo: '', editorial: '', edicion: '', portada: '' });
        const vistaGaleria = ref(false);

        const cargarLibros = async () => {
            libros.value = await db.libros.toArray();
        };

        const buscarLibroISBN = async () => {
            if (!formLibro.value.isbn) return;
            isSearching.value = true;
            isbnError.value = '';
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${formLibro.value.isbn}`);
                const data = await response.json();
                
                if (data.totalItems > 0) {
                    const info = data.items[0].volumeInfo;
                    formLibro.value.titulo = info.title || '';
                    formLibro.value.editorial = info.publisher || '';
                    formLibro.value.edicion = info.publishedDate || '';
                    formLibro.value.portada = info.imageLinks?.thumbnail || '';
                    alertify.success('Datos y portada recuperados');
                } else {
                    isbnError.value = 'No se encontró información para este ISBN';
                    alertify.warning('Libro no encontrado en la API');
                }
            } catch (error) {
                isbnError.value = 'Error al consultar la API';
                alertify.error('Error de conexión');
            } finally {
                isSearching.value = false;
            }
        };

        const procesarImagenArchivo = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
                alertify.error('La imagen es demasiado grande (máx 2MB)');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                formLibro.value.portada = e.target.result;
                alertify.success('Imagen cargada correctamente');
            };
            reader.readAsDataURL(file);
        };

        const guardarLibro = async () => {
            isSaving.value = true;
            try {
                const data = {
                    idAutor: parseInt(formLibro.value.idAutor, 10),
                    idCategoria: parseInt(formLibro.value.idCategoria, 10) || null,
                    isbn: formLibro.value.isbn,
                    titulo: formLibro.value.titulo,
                    editorial: formLibro.value.editorial,
                    edicion: formLibro.value.edicion,
                    portada: formLibro.value.portada
                };

                if (editModeLibro.value) {
                    await db.libros.update(formLibro.value.idLibro, data);
                    alertify.success('Libro actualizado correctamente');
                } else {
                    await db.libros.add(data);
                    alertify.success('Libro guardado correctamente');
                }
                await cargarLibros();
                cancelarEdicionLibro();
            } catch (error) {
                alertify.error('Error al guardar el libro');
            } finally {
                setTimeout(() => {
                    isSaving.value = false;
                }, 500);
            }
        };

        const editarLibro = (libro) => {
            formLibro.value = { ...libro };
            editModeLibro.value = true;
        };

        const eliminarLibro = async (id) => {
            alertify.confirm('Confirmar eliminación', '¿Estás seguro de eliminar este libro?',
                async () => {
                    await db.libros.delete(id);
                    await cargarLibros();
                    alertify.success('Libro eliminado correctamente');
                },
                () => {
                    alertify.error('Operación cancelada');
                }
            ).set('labels', {ok:'Si, eliminar', cancel:'Cancelar'});
        };

        const cancelarEdicionLibro = () => {
            formLibro.value = { idLibro: null, idAutor: '', idCategoria: '', isbn: '', titulo: '', editorial: '', edicion: '', portada: '' };
            editModeLibro.value = false;
            isbnError.value = '';
        };

        // Lógica de Préstamos
        const prestamos = ref([]);
        const editModePrestamo = ref(false);
        const formPrestamo = ref({ idPrestamo: null, idLibro: '', idUsuario: '', fechaPrestamo: '', fechaDevolucion: '', estado: 'Prestado' });

        const cargarPrestamos = async () => {
            prestamos.value = await db.prestamos.toArray();
        };

        const guardarPrestamo = async () => {
            isSaving.value = true;
            try {
                const idLibroParsed = parseInt(formPrestamo.value.idLibro, 10);

                // --- VALIDACIÓN DE DISPONIBILIDAD (STOCK) ---
                if (!editModePrestamo.value) {
                    const libroOcupado = prestamos.value.find(p => p.idLibro === idLibroParsed && p.estado === 'Prestado');
                    if (libroOcupado) {
                        alertify.error('Error: Este libro ya se encuentra prestado actualmente.');
                        isSaving.value = false;
                        return; // Evita que se guarde
                    }
                }

                const data = {
                    idLibro: idLibroParsed,
                    idUsuario: parseInt(formPrestamo.value.idUsuario, 10),
                    fechaPrestamo: formPrestamo.value.fechaPrestamo,
                    fechaDevolucion: formPrestamo.value.fechaDevolucion,
                    estado: formPrestamo.value.estado
                };

                if (editModePrestamo.value) {
                    await db.prestamos.update(formPrestamo.value.idPrestamo, data);
                    alertify.success('Préstamo actualizado');
                } else {
                    await db.prestamos.add(data);
                    alertify.success('Préstamo registrado');
                }
                await cargarPrestamos();
                cancelarEdicionPrestamo();
            } catch (error) {
                alertify.error('Error al guardar préstamo');
            } finally {
                setTimeout(() => isSaving.value = false, 500);
            }
        };

        const editarPrestamo = (p) => {
            formPrestamo.value = { ...p };
            editModePrestamo.value = true;
        };

        const eliminarPrestamo = async (id) => {
            alertify.confirm('Eliminar Préstamo', '¿Borrar este registro?', 
                async () => {
                    await db.prestamos.delete(id);
                    await cargarPrestamos();
                    alertify.success('Eliminado');
                }, null
            );
        };

        const devolverLibro = async (id) => {
            await db.prestamos.update(id, { estado: 'Devuelto' });
            await cargarPrestamos();
            alertify.success('Libro marcado como devuelto');
        };

        const cancelarEdicionPrestamo = () => {
            formPrestamo.value = { idPrestamo: null, idLibro: '', idUsuario: '', fechaPrestamo: '', fechaDevolucion: '', estado: 'Prestado' };
            editModePrestamo.value = false;
        };

        const obtenerTituloLibro = (idLibro) => {
            const libro = libros.value.find(l => l.idLibro === idLibro);
            return libro ? libro.titulo : 'Libro no encontrado';
        };

        const obtenerNombreUsuario = (idUsuario) => {
            const user = usuarios.value.find(u => u.idUsuario === idUsuario);
            return user ? user.nombre : 'Lector Desconocido';
        };

        // --- MANEJO DE ALERTAS DE VENCIMIENTO ---
        const esAtrasado = (fechaDevolucion, estado) => {
            if (estado !== 'Prestado') return false;
            const hoy = new Date().toISOString().split('T')[0];
            return fechaDevolucion < hoy;
        };

        // --- CHART.JS ANALYTICS DASHBOARD ---
        let myChart = null;
        
        const renderChart = () => {
            if (rolActual.value !== 'admin') return;
            setTimeout(() => {
                const ctx = document.getElementById('popularBooksChart');
                if (!ctx) return;
                
                if (myChart) myChart.destroy();
                
                const counts = {};
                prestamos.value.forEach(p => {
                    counts[p.idLibro] = (counts[p.idLibro] || 0) + 1;
                });
                
                const topBooks = Object.keys(counts)
                    .sort((a, b) => counts[b] - counts[a])
                    .slice(0, 5)
                    .map(id => ({
                        titulo: obtenerTituloLibro(parseInt(id, 10)),
                        cantidad: counts[id]
                    }));
                
                if (topBooks.length === 0) return;

                myChart = new window.Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: topBooks.map(b => b.titulo.substring(0, 20) + (b.titulo.length > 20 ? '...' : '')),
                        datasets: [{
                            label: 'Veces Prestado',
                            data: topBooks.map(b => b.cantidad),
                            backgroundColor: 'rgba(13, 110, 253, 0.7)',
                            borderColor: 'rgba(13, 110, 253, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }
                });
            }, 300);
        };

        watch(currentTab, (newVal) => {
            if (newVal === 'dashboard') {
                renderChart();
            }
        });
        
        watch(prestamos, () => {
            if (currentTab.value === 'dashboard') {
                renderChart();
            }
        }, { deep: true });
        // -------------------------------------

        const librosFiltrados = computed(() => {
            const qr = filtroLibro.value.toLowerCase().trim();
            if (!qr) return libros.value;
            return libros.value.filter(l => 
                l.titulo.toLowerCase().includes(qr) ||
                l.isbn.toLowerCase().includes(qr) ||
                l.editorial.toLowerCase().includes(qr)
            );
        });

        const obtenerNombreAutor = (idAutor) => {
            const autor = autores.value.find(a => a.idAutor === idAutor);
            return autor ? autor.nombre : 'Desconocido/Eliminado';
        };

        const obtenerNombreCategoria = (idCategoria) => {
            if (!idCategoria) return 'Sin Categoría';
            const cat = categorias.value.find(c => c.idCategoria === idCategoria);
            return cat ? cat.nombre : 'Eliminada';
        };

        onMounted(async () => {
            try {
                await cargarUsuarios();
                await cargarCategorias();
                await cargarAutores();
                await cargarLibros();
                await cargarPrestamos();
                renderChart();
            } catch (error) {
                console.error("Error al cargar la base de datos IndexedDB:", error);
                alertify.error("Error al cargar registros. IndexedDB podría estar bloqueado en el navegador.", 5);
            }
        });

        return {
            sidebarVisible,
            windowWidth,
            darkMode,
            toggleDarkMode,
            currentTab,
            simuladorLoginId,
            rolActual,
            cambiarSesion,
            categorias,
            editModeCategoria,
            formCategoria,
            guardarCategoria,
            editarCategoria,
            eliminarCategoria,
            cancelarEdicionCategoria,
            autores,
            filtroAutor,
            editModeAutor,
            formAutor,
            guardarAutor,
            editarAutor,
            eliminarAutor,
            cancelarEdicionAutor,
            autoresFiltrados,
            usuarios,
            filtroUsuario,
            editModeUsuario,
            formUsuario,
            guardarUsuario,
            editarUsuario,
            eliminarUsuario,
            cancelarEdicionUsuario,
            usuariosFiltrados,
            libros,
            filtroLibro,
            editModeLibro,
            formLibro,
            guardarLibro,
            editarLibro,
            eliminarLibro,
            cancelarEdicionLibro,
            librosFiltrados,
            obtenerNombreAutor,
            isSaving,
            isSearching,
            buscarLibroISBN,
            isbnError,
            vistaGaleria,
            procesarImagenArchivo,
            prestamos,
            formPrestamo,
            editModePrestamo,
            guardarPrestamo,
            editarPrestamo,
            eliminarPrestamo,
            devolverLibro,
            cancelarEdicionPrestamo,
            obtenerTituloLibro,
            obtenerNombreUsuario,
            esAtrasado,
            obtenerNombreCategoria,
            guardarAnotacion,
            misPrestamos,
            autoPrestamo
        };
    }
};

const app = createApp(App);
app.mount('#app');