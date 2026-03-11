import { createApp, ref, computed, onMounted } from 'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.esm-browser.js';
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs';

const db = new Dexie('db_usss017224_jonathan_guandique');

db.version(2).stores({
    autor: '++idAutor, codigo, nombre, pais, telefono',
    libros: '++idLibro, idAutor, isbn, titulo, editorial, edicion, portada',
    prestamos: '++idPrestamo, idLibro, lector, fechaPrestamo, fechaDevolucion, estado'
});

const App = {
    setup() {
        const sidebarVisible = ref(false);
        const windowWidth = ref(window.innerWidth);
        const darkMode = ref(localStorage.getItem('theme') === 'dark');
        
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

        const autores = ref([]);
        const filtroAutor = ref('');
        const editModeAutor = ref(false);
        const formAutor = ref({ idAutor: null, codigo: '', nombre: '', pais: '', telefono: '' });
        const isSaving = ref(false);
        const isSearching = ref(false);
        const isbnError = ref('');

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

        const libros = ref([]);
        const filtroLibro = ref('');
        const editModeLibro = ref(false);
        const formLibro = ref({ idLibro: null, idAutor: '', isbn: '', titulo: '', editorial: '', edicion: '', portada: '' });
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
            formLibro.value = { idLibro: null, idAutor: '', isbn: '', titulo: '', editorial: '', edicion: '', portada: '' };
            editModeLibro.value = false;
            isbnError.value = '';
        };

        // Lógica de Préstamos
        const prestamos = ref([]);
        const editModePrestamo = ref(false);
        const formPrestamo = ref({ idPrestamo: null, idLibro: '', lector: '', fechaPrestamo: '', fechaDevolucion: '', estado: 'Prestado' });

        const cargarPrestamos = async () => {
            prestamos.value = await db.prestamos.toArray();
        };

        const guardarPrestamo = async () => {
            isSaving.value = true;
            try {
                const data = {
                    idLibro: parseInt(formPrestamo.value.idLibro, 10),
                    lector: formPrestamo.value.lector,
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
            formPrestamo.value = { idPrestamo: null, idLibro: '', lector: '', fechaPrestamo: '', fechaDevolucion: '', estado: 'Prestado' };
            editModePrestamo.value = false;
        };

        const obtenerTituloLibro = (idLibro) => {
            const libro = libros.value.find(l => l.idLibro === idLibro);
            return libro ? libro.titulo : 'Libro no encontrado';
        };

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

        onMounted(async () => {
            try {
                await cargarAutores();
                await cargarLibros();
                await cargarPrestamos();
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
            autores,
            filtroAutor,
            editModeAutor,
            formAutor,
            guardarAutor,
            editarAutor,
            eliminarAutor,
            cancelarEdicionAutor,
            autoresFiltrados,
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
            obtenerTituloLibro
        };
    }
};

const app = createApp(App);
app.mount('#app');