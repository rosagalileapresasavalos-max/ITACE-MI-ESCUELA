"use strict";

/* ============================================================
   INICIO: inicialización general de la página
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (window.__itaceIniciado)
        return;
    window.__itaceIniciado = true;
    // Utilidad para seleccionar elementos del HTML.
    const $ = s => document.querySelector(s);
    const body = document.body, raiz = document.documentElement;
    const tema = $('.tema-toggle');
    const actualizarTema = () => { const oscuro = body.classList.contains('dark-mode'); tema.textContent = oscuro ? '☀️' : '🌙'; tema.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro'); tema.title = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'; raiz.dataset.theme = oscuro ? 'dark' : 'light'; };
    let guardado = '';
    try {
        guardado = localStorage.getItem('itace-tema') || '';
    }
    catch (e) { }
    if (guardado === 'oscuro' || guardado === 'dark')
        body.classList.add('dark-mode');
    actualizarTema();
    tema.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        actualizarTema();
        try {
            localStorage.setItem('itace-tema', body.classList.contains('dark-mode') ? 'oscuro' : 'claro');
        }
        catch (e) { }
    });
    /* MENÚ DE NAVEGACIÓN */
    const menu = $('.menu'), hamburguesa = $('.menu-toggle'), explorar = $('#menuExplorar'), desplegable = $('.menu-desplegable');
    const cerrarExplorar = () => { desplegable.classList.remove('abierto'); explorar.setAttribute('aria-expanded', 'false'); };
    const cerrarMenu = () => { menu.classList.remove('abierto'); hamburguesa.textContent = '☰'; hamburguesa.setAttribute('aria-expanded', 'false'); hamburguesa.setAttribute('aria-label', 'Abrir menú'); cerrarExplorar(); };
    hamburguesa.addEventListener('click', () => { const abierto = menu.classList.toggle('abierto'); hamburguesa.textContent = abierto ? '✕' : '☰'; hamburguesa.setAttribute('aria-expanded', String(abierto)); hamburguesa.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú'); });
    explorar.addEventListener('click', () => { const abierto = desplegable.classList.toggle('abierto'); explorar.setAttribute('aria-expanded', String(abierto)); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
    document.addEventListener('click', e => {
        if (!desplegable.contains(e.target))
            cerrarExplorar();
        if (!menu.contains(e.target) && !hamburguesa.contains(e.target) && menu.classList.contains('abierto'))
            cerrarMenu();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape')
            cerrarMenu();
    });
    /* GALERÍA Y VISOR DE FOTOGRAFÍAS */
    const fotos = [...document.querySelectorAll('.galeria .foto')], visor = $('.lightbox');
    if (visor && fotos.length) {
        const img = visor.querySelector('figure img'), pie = visor.querySelector('figcaption'), cerrar = visor.querySelector('.lightbox-cerrar');
        let indice = 0, anterior = null;
        const mostrar = n => { indice = (n + fotos.length) % fotos.length; const foto = fotos[indice], mini = foto.querySelector('img'); img.src = foto.dataset.full || mini.src; img.alt = foto.dataset.caption || mini.alt; pie.textContent = img.alt; };
        const salir = () => { visor.classList.remove('abierto'); visor.setAttribute('aria-hidden', 'true'); body.classList.remove('lightbox-abierto'); img.removeAttribute('src'); anterior?.focus(); };
        fotos.forEach((f, i) => f.addEventListener('click', () => { anterior = document.activeElement; mostrar(i); visor.classList.add('abierto'); visor.setAttribute('aria-hidden', 'false'); body.classList.add('lightbox-abierto'); cerrar.focus(); }));
        cerrar.addEventListener('click', salir);
        visor.querySelector('.lightbox-anterior').addEventListener('click', () => mostrar(indice - 1));
        visor.querySelector('.lightbox-siguiente').addEventListener('click', () => mostrar(indice + 1));
        visor.addEventListener('click', e => {
            if (e.target === visor)
                salir();
        });
        document.addEventListener('keydown', e => {
            if (!visor.classList.contains('abierto'))
                return;
            if (e.key === 'Escape')
                salir();
            if (e.key === 'ArrowLeft')
                mostrar(indice - 1);
            if (e.key === 'ArrowRight')
                mostrar(indice + 1);
        });
    }
    /* ANIMACIONES AL DESPLAZARSE */
    const revelar = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ob = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                ob.unobserve(e.target);
            }
        }), { threshold: .08 });
        raiz.classList.add('js-animaciones');
        revelar.forEach(x => ob.observe(x));
    }
    else
        revelar.forEach(x => x.classList.add('visible'));
    const faqs = [...document.querySelectorAll('.faq details')];
    faqs.forEach(f => f.addEventListener('toggle', () => {
        if (f.open)
            faqs.forEach(g => {
                if (g !== f)
                    g.open = false;
            });
    }));
    /* REPRODUCCIÓN DE VIDEO: solo uno a la vez */
    const videos = [...document.querySelectorAll('video')];
    videos.forEach(video => {
        video.addEventListener('play', () => {
            videos.forEach(otro => {
                if (otro !== video && !otro.paused) otro.pause();
            });
        });
    });
    /* REPRODUCTOR DE MÚSICA */
    const audio = $('#musicaFondo'), panel = $('#musicaPanel'), boton = $('#musicaBoton'), play = $('#musicaPlay'), estado = $('#musicaEstado'), volumen = $('#musicaVolumen');
    if (audio && panel && boton && play) {
        audio.volume = .25;
        const actualizar = () => { const sonando = !audio.paused; play.textContent = sonando ? '❚❚' : '▶'; play.setAttribute('aria-label', sonando ? 'Pausar música' : 'Reproducir música'); boton.textContent = sonando ? '♫' : '🎵'; boton.classList.toggle('reproduciendo', sonando); };
        const cerrarPanel = () => { panel.hidden = true; boton.setAttribute('aria-expanded', 'false'); };
        boton.addEventListener('click', () => { panel.hidden = !panel.hidden; boton.setAttribute('aria-expanded', String(!panel.hidden)); });
        $('#musicaCerrar').addEventListener('click', cerrarPanel);
        play.addEventListener('click', async () => {
            if (!audio.paused) {
                audio.pause();
                estado.textContent = 'Música en pausa.';
                return;
            }
            estado.textContent = 'Cargando música...';
            try {
                await audio.play();
                estado.textContent = 'Disfruta de la música. ♡';
            }
            catch (e) {
                estado.textContent = 'No se pudo reproducir. Revisa audio/himno-tamaulipas.mp3';
            }
            actualizar();
        });
        volumen.addEventListener('input', () => audio.volume = Number(volumen.value) / 100);
        ['play', 'pause', 'ended'].forEach(x => audio.addEventListener(x, actualizar));
        audio.addEventListener('error', () => { estado.textContent = 'No se encontró audio/himno-tamaulipas.mp3'; actualizar(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !panel.hidden)
                cerrarPanel();
        });
        actualizar();
    }
    /* QUIZ / RETO SOBRE ITACE */
    const preguntas = [{ pregunta: '¿En qué año se fundó el ITACE?', opciones: ['1984', '1991', '1998', '2004'], correcta: 0 }, { pregunta: '¿En qué ciudad se fundó el primer plantel?', opciones: ['Reynosa', 'Matamoros', 'Ciudad Victoria', 'Altamira'], correcta: 2 }, { pregunta: '¿En qué año se firmó el convenio para la unidad de Reynosa?', opciones: ['1984', '1991', '1993', '2019'], correcta: 1 }, { pregunta: '¿Qué modalidad incorporó el ITACE en 1998?', opciones: ['Educación primaria', 'Bachillerato tecnológico', 'Preescolar', 'Educación exclusivamente en línea'], correcta: 1 }, { pregunta: '¿Cuál es un objetivo de la formación del ITACE?', opciones: ['Preparar estudiantes para el ámbito académico y laboral', 'Solo deportes', 'Solo idiomas', 'Eliminar la formación técnica'], correcta: 0 }];
    const pregunta = $('#quizPregunta'), opciones = $('#quizOpciones'), siguiente = $('#quizSiguiente'), resultado = $('#quizResultado');
    if (pregunta && opciones && siguiente && resultado) {
        let actual = 0, puntos = 0, respondida = false;
        const dibujar = () => {
            const p = preguntas[actual];
            respondida = false;
            $('#quizContador').textContent = `Pregunta ${actual + 1} de ${preguntas.length}`;
            $('#quizPuntos').textContent = `${puntos} puntos`;
            $('#quizProgreso').style.width = `${actual / preguntas.length * 100}%`;
            pregunta.textContent = p.pregunta;
            opciones.replaceChildren();
            $('#quizMensaje').textContent = '';
            siguiente.hidden = true;
            resultado.hidden = true;
            p.opciones.forEach((op, i) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'quiz-opcion';
                b.textContent = op;
                b.addEventListener('click', () => {
                    if (respondida)
                        return;
                    respondida = true;
                    const correcto = i === p.correcta;
                    if (correcto)
                        puntos++;
                    opciones.querySelectorAll('button').forEach((el, j) => {
                        el.disabled = true;
                        if (j === p.correcta)
                            el.classList.add('correcta');
                        else if (j === i)
                            el.classList.add('incorrecta');
                    });
                    $('#quizMensaje').textContent = correcto ? '¡Muy bien! Respuesta correcta. 💗' : 'La respuesta correcta está marcada en verde.';
                    $('#quizPuntos').textContent = `${puntos} puntos`;
                    $('#quizProgreso').style.width = `${(actual + 1) / preguntas.length * 100}%`;
                    siguiente.textContent = actual === preguntas.length - 1 ? 'Ver mi resultado →' : 'Siguiente pregunta →';
                    siguiente.hidden = false;
                });
                opciones.appendChild(b);
            });
        };
        siguiente.addEventListener('click', () => {
            actual++;
            if (actual < preguntas.length)
                dibujar();
            else {
                $('#quizContador').textContent = '¡Reto completado!';
                pregunta.textContent = '';
                opciones.replaceChildren();
                $('#quizMensaje').textContent = '';
                siguiente.hidden = true;
                resultado.hidden = false;
                $('#quizProgreso').style.width = '100%';
                $('#quizResultadoTexto').textContent = `Obtuviste ${puntos} de ${preguntas.length} puntos. ${puntos === 5 ? '¡Excelente!' : puntos >= 3 ? '¡Muy bien!' : '¡Sigue explorando el ITACE!'}`;
            }
        });
        $('#quizReiniciar').addEventListener('click', () => { actual = 0; puntos = 0; dibujar(); });
        dibujar();
    }
    /* DIRECTORIO DOCENTE: búsqueda, filtros, fotos y avatares */
    const directorio = $('#docentesGrid');
    const buscarDocente = $('#buscarDocente');
    const filtroAcademia = $('#filtroAcademia');
    const limpiarDocentes = $('#limpiarDocentes');
    const resumenDocentes = $('#resumenDocentes');
    if (directorio && buscarDocente && filtroAcademia && limpiarDocentes && resumenDocentes) {
        const datosLocales = [{"nombre":"Gerardo de la Rosa Ortega","academia":"Idiomas","materias":"Inglés","semestres":"Quinto","perfil":"Licenciado en contaduría","avatar":"👨‍🏫","area":"Idiomas"},{"nombre":"Bertha Alicia Zapata Aldape","academia":"Matemáticas","materias":"No especificadas","semestres":"1 y 3","perfil":"Doctorado; 2 años y medio en ITACE","avatar":"👩‍🏫","area":"Matemáticas"},{"nombre":"Carlos Melecio Carmona Olivares","academia":"Diseño gráfico e inglés","materias":"No especificadas","semestres":"1 y 3","perfil":"Licenciatura en diseño gráfico (UVB); maestría en educación básica (UPN); 2 años en ITACE","avatar":"👨‍🏫","area":"Diseño gráfico e inglés"},{"nombre":"Erik Ramírez Solís","academia":"Matemáticas","materias":"Pensamiento matemático","semestres":"1, 3 y 5","perfil":"Ingeniería electromecánica; maestría en educación; 21 años en ITACE","avatar":"👨‍🏫","area":"Matemáticas"},{"nombre":"Grecia Ávalos Ramos","academia":"Comunicación","materias":"Lengua y comunicación","semestres":"1 y 3","perfil":"Licenciatura y maestría; salón B1; 3 años en ITACE","avatar":"👩‍🏫","area":"Comunicación"},{"nombre":"Sandra Catalina Silva Camacho","academia":"Comunicación","materias":"Comunicación","semestres":"Todos (hasta 5)","perfil":"Maestría en metodología de la enseñanza; salón B4; 25 años en ITACE","avatar":"👩‍🏫","area":"Comunicación"},{"nombre":"Liliana Rosas Pacheco","academia":"Humanidades y comunicación","materias":"Pensamiento filosófico, conciencia histórica, lengua y comunicación, formación socioemocional","semestres":"1 y 5","perfil":"Licenciatura en pedagogía; posgrados en educación, docencia y doctorado en educación; 5 años en ITACE","avatar":"👩‍🏫","area":"Humanidades y comunicación"},{"nombre":"Carla Valeria Morán Lerma","academia":"Humanidades","materias":"Pensamiento filosófico, ciencias sociales y cultura digital","semestres":"1 y 3","perfil":"Maestría; salón B3; 33 años en ITACE","avatar":"👩‍🏫","area":"Humanidades"},{"nombre":"Benjamín Limón Martínez","academia":"Informática","materias":"Programación, inteligencia artificial y cultura digital","semestres":"5, 3 y 1 respectivamente","perfil":"Administración en productividad y calidad; maestría en educación; salón Laboratorio 5; 5 años en ITACE","avatar":"👨‍🏫","area":"Informática"},{"nombre":"Isidro de León Flores","academia":"Educación","materias":"Área de educación (dato original: “Educación Fp”)","semestres":"Todos","perfil":"Licenciatura en psicopedagogía y pedagogía; salón C4; 29 años en ITACE","avatar":"👨‍🏫","area":"Educación"},{"nombre":"Norma Elena Torres Quiñones","academia":"Ciencias naturales e IT","materias":"Ciencias naturales e IT","semestres":"1, 3 y 5","perfil":"Ingeniería química; maestría en docencia; salón B2; 26 años en ITACE","avatar":"👩‍🏫","area":"Ciencias naturales e IT"},{"nombre":"Luis Enrique Lerma Martínez","academia":"Conciencia histórica y comunicación","materias":"Formación socioemocional I, lengua y comunicación I y III, conciencia histórica II; módulos de mantenimiento petrolero e industrial","semestres":"1, 3 y 5","perfil":"Licenciatura en pedagogía; ingeniería petrolera; diplomado en competencias docentes; 33 años en ITACE","avatar":"👨‍🏫","area":"Conciencia histórica y comunicación"},{"nombre":"Brenda Itzel Herrera García","academia":"Informática","materias":"Cultura digital e inteligencia artificial","semestres":"3 y 1","perfil":"Técnica en informática; ingeniería en sistemas computacionales; maestría en educación; 4 años en ITACE","avatar":"👩‍🏫","area":"Informática"},{"nombre":"Walter Allan Barrera Cerda","academia":"Comunicación e idiomas","materias":"Inglés 3; club Rondalla","semestres":"Inglés 3; club 1, 2 y 3","perfil":"Ingeniería industrial y administración; 13 años en ITACE","avatar":"👨‍🏫","area":"Comunicación e idiomas"},{"nombre":"Laura Esmeralda Heredia Blanco","academia":"Ciencias naturales","materias":"Física, química y ciencias","semestres":"1, 3 y 5","perfil":"Bióloga","avatar":"👩‍🏫","area":"Ciencias naturales"},{"nombre":"Felipe Hernández González","academia":"Eléctrica y electrónica","materias":"Módulo eléctrica/electrónica y semiconductores","semestres":"3 y 5","perfil":"Ingeniería en electrónica","avatar":"👨‍🏫","area":"Eléctrica y electrónica"},{"nombre":"José López Vázquez","academia":"Mantenimiento industrial","materias":"Módulo de mantenimiento industrial","semestres":"3 I y 5 I (turno vespertino)","perfil":"Ingeniería industrial","avatar":"👨‍🏫","area":"Mantenimiento industrial"},{"nombre":"Yuridia Lizbeth Cepeda Ramos","academia":"Idiomas y matemáticas","materias":"Inglés y temas selectos de matemáticas 2","semestres":"No especificados","perfil":"Ingeniería industrial; licenciatura en matemáticas; maestría en educación e innovación educativa; cursa doctorado en educación","avatar":"👩‍🏫","area":"Idiomas y matemáticas"},{"nombre":"Juan Pablo Torres Adame","academia":"Informática","materias":"Programación, cultura digital; club de robótica; cursos de Excel los sábados","semestres":"1, 3 y 5","perfil":"Licenciatura en información administrativa; maestría en ciencias de la enseñanza","avatar":"👨‍🏫","area":"Informática"},{"nombre":"Romualdo Guadalupe de la Cruz","academia":"Matemáticas","materias":"Pensamiento matemático; mantenimiento industrial e instalaciones petroleras","semestres":"1 y 3","perfil":"","avatar":"👨‍🏫","area":"Matemáticas"},{"nombre":"Nohemí Quintanilla Arcos","academia":"No especificada","materias":"No especificadas","semestres":"No especificados","perfil":"Especialidad registrada como “perfecta” en la información recibida; confirmar dato","avatar":"👩‍🏫","area":"No especificada"},{"nombre":"Ulises Solís Rieboles","academia":"Ciencias naturales","materias":"Ciencias naturales","semestres":"1, 3 y 5","perfil":"Químico farmacéutico biólogo; maestrías en análisis clínicos y educación; cursa doctorado en educación","avatar":"👨‍🏫","area":"Ciencias naturales"},{"nombre":"Diana Janeth Uriegas Garza","academia":"Comunicación y matemáticas","materias":"Club de oratoria, habilidades para hablar en público y matemáticas básicas","semestres":"1, 3 y 5","perfil":"Licenciatura en administración; Instituto Tecnológico de Reynosa","avatar":"👩‍🏫","area":"Comunicación y matemáticas"},{"nombre":"José Luis González López","academia":"Semiconductores y matemáticas","materias":"Módulo de semiconductores; pensamiento matemático","semestres":"3","perfil":"","avatar":"👨‍🏫","area":"Semiconductores y matemáticas"},{"nombre":"Javier Alfonso Acosta García","academia":"Mantenimiento automotriz","materias":"Módulo de máquinas y mantenimiento automotriz","semestres":"3 y 5","perfil":"Ingeniería electromecánica; maestría en ingeniería industrial y manufactura avanzada","avatar":"👨‍🏫","area":"Mantenimiento automotriz"},{"nombre":"Mario Alonso Santoyo Arroyo","academia":"Mantenimiento industrial","materias":"Módulo profesional de mantenimiento industrial 2 y 4","semestres":"5 y 3 (según información recibida)","perfil":"Maestría en educación; carrera técnica en refrigeración y climatización; ingeniería industrial","avatar":"👨‍🏫","area":"Mantenimiento industrial"},{"nombre":"Erika Aidé Pérez Ábrego","academia":"Ciencias naturales y humanidades","materias":"Ciencias naturales y humanidades","semestres":"3 y 5","perfil":"Ingeniería industrial y de sistemas; maestría en educación","avatar":"👩‍🏫","area":"Ciencias naturales y humanidades"},{"nombre":"Omar Saúl González Alatriste","academia":"Prefectura","materias":"Responsable de tercer semestre","semestres":"No especificados","perfil":"Prefecto; 32 años en ITACE","avatar":"👨‍🏫","area":"Prefectura"},{"nombre":"Mildred Yasmín Reyes Norberto","academia":"Matemáticas","materias":"Temas selectos de matemáticas 2","semestres":"5","perfil":"Ingeniería química; maestría en docencia","avatar":"👩‍🏫","area":"Matemáticas"}];
        let listaDocentes = [];
        const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const valorTexto = valor => Array.isArray(valor) ? valor.join(', ') : (valor || 'No especificado');
        const crearTexto = (etiqueta, valor) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = etiqueta + ': ';
            p.append(strong, document.createTextNode(valorTexto(valor)));
            return p;
        };
        const dibujarDocentes = () => {
            const termino = normalizar(buscarDocente.value);
            const academia = filtroAcademia.value;
            const hayCriterio = Boolean(termino || academia);
            const filtrados = hayCriterio ? listaDocentes.filter(docente => {
                const texto = normalizar([docente.nombre, docente.academia, docente.area, docente.materias, docente.semestres, docente.perfil].join(' '));
                const coincideTexto = !termino || texto.includes(termino);
                const coincideFiltro = !academia || normalizar([docente.academia, docente.area, docente.materias].join(' ')).includes(normalizar(academia));
                return coincideTexto && coincideFiltro;
            }) : [];
            directorio.replaceChildren();
            if (!hayCriterio) {
                resumenDocentes.textContent = 'Escribe un nombre o selecciona una materia o academia para ver los docentes.';
                const vacio = document.createElement('p'); vacio.className = 'directorio-vacio';
                vacio.textContent = 'Los perfiles aparecerán aquí cuando realices una búsqueda o elijas un filtro.';
                directorio.appendChild(vacio); return;
            }
            resumenDocentes.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'docente encontrado' : 'docentes encontrados'}.`;
            if (!filtrados.length) {
                const vacio = document.createElement('p'); vacio.className = 'directorio-vacio';
                vacio.textContent = 'No se encontraron coincidencias. Prueba otra búsqueda o limpia los filtros.';
                directorio.appendChild(vacio); return;
            }
            filtrados.forEach(docente => {
                // FOTO DEL DOCENTE
                // Solo estos nueve perfiles usan fotografía. Los demás conservan su avatar ilustrado.
                const fotosDocentes = {
                    'Brenda Itzel Herrera García': 'brenda.jpg',
                    'Erik Ramírez Solís': 'erik.jpg',
                    'Felipe Hernández González': 'felipe.jpg',
                    'Gerardo de la Rosa Ortega': 'gerardo.jpg',
                    'Juan Pablo Torres Adame': 'juan-pablo.jpg',
                    'Luis Enrique Lerma Martínez': 'lerma.jpg',
                    'Liliana Rosas Pacheco': 'liliana.jpg',
                    'Omar Saúl González Alatriste': 'omar.jpg',
                    'Ulises Solís Rieboles': 'ulises.jpg',
                    'Isidro de León Flores': 'isidro.jpg',
                    'Walter Allan Barrera Cerda': 'wualter.jpg'
                };

                const tarjeta = document.createElement('article');
                tarjeta.className = 'docente-card';

                const nombreFoto = fotosDocentes[docente.nombre];
                let avatar;
                if (nombreFoto) {
                    avatar = document.createElement('img');
                    avatar.className = 'docente-avatar docente-foto';
                    avatar.src = `imagenes/${nombreFoto}`;
                    avatar.alt = `Fotografía de ${docente.nombre}`;
                    avatar.loading = 'lazy';
                    avatar.addEventListener('error', () => {
                        // Si falta una foto, muestra un avatar en vez de dejar un icono roto.
                        const respaldo = document.createElement('div');
                        respaldo.className = 'docente-avatar';
                        respaldo.setAttribute('aria-hidden', 'true');
                        respaldo.textContent = docente.avatar || '👩‍🏫';
                        avatar.replaceWith(respaldo);
                    }, { once: true });
                } else {
                    // AVATAR PROVISIONAL: usar ilustración según el género indicado en los datos.
                    // Los archivos están dentro de la carpeta /imagenes.
                    avatar = document.createElement('img');
                    avatar.className = 'docente-avatar docente-foto docente-avatar-imagen';
                    const esMaestro = String(docente.avatar || '').includes('👨');
                    avatar.src = esMaestro ? 'imagenes/avatar-hombres.jpg' : 'imagenes/avatar-mujer.jpg';
                    avatar.alt = esMaestro ? 'Avatar ilustrado de maestro' : 'Avatar ilustrado de maestra';
                    avatar.loading = 'lazy';
                    avatar.addEventListener('error', () => {
                        // Respaldo accesible si falta un archivo de avatar.
                        const respaldo = document.createElement('div');
                        respaldo.className = 'docente-avatar';
                        respaldo.setAttribute('aria-hidden', 'true');
                        respaldo.textContent = docente.avatar || '👩‍🏫';
                        avatar.replaceWith(respaldo);
                    }, { once: true });
                }

                const datos = document.createElement('div');
                datos.className = 'docente-datos';
                const nombre = document.createElement('h3'); nombre.textContent = docente.nombre || 'Nombre por completar';
                datos.append(nombre, crearTexto('Academia / área', docente.academia || docente.area), crearTexto('Materias', docente.materias), crearTexto('Semestres', docente.semestres));
                if (docente.perfil && docente.perfil !== 'No especificado') datos.appendChild(crearTexto('Formación y otros datos', docente.perfil));
                tarjeta.append(avatar, datos); directorio.appendChild(tarjeta);
            });
        };
        const cargarDirectorio = datos => {
            listaDocentes = datos.filter(docente => docente && typeof docente === 'object' && docente.nombre);
            filtroAcademia.replaceChildren();
            const todas = document.createElement('option'); todas.value = ''; todas.textContent = 'Selecciona materia o academia'; filtroAcademia.appendChild(todas);
            const materias = [...new Set(listaDocentes.flatMap(docente => String(docente.materias || '').split(/[;,]/).map(m => m.trim()).filter(m => m && !/^no especificad/i.test(m))))];
            const academias = [...new Set(listaDocentes.flatMap(docente => [docente.academia, docente.area]).filter(Boolean))];
            const opciones = [...new Set([...materias, ...academias])].sort((a,b) => a.localeCompare(b,'es'));
            opciones.forEach(nombre => { const opcion = document.createElement('option'); opcion.value = nombre; opcion.textContent = nombre; filtroAcademia.appendChild(opcion); });
            dibujarDocentes();
        };
        // El JSON es la fuente principal; los datos integrados son respaldo para abrir el HTML sin servidor.
        fetch('datos/docentes.json').then(respuesta => { if (!respuesta.ok) throw new Error('JSON no disponible'); return respuesta.json(); })
            .then(datos => { if (!Array.isArray(datos)) throw new Error('Formato JSON inválido'); cargarDirectorio(datos); })
            .catch(() => cargarDirectorio(datosLocales));
        buscarDocente.addEventListener('input', dibujarDocentes);
        filtroAcademia.addEventListener('change', dibujarDocentes);
        limpiarDocentes.addEventListener('click', () => { buscarDocente.value = ''; filtroAcademia.value = ''; dibujarDocentes(); buscarDocente.focus(); });
    }
    /* BARRA DE PROGRESO DE LECTURA */
    const barra = $('#barraLectura');
    if (barra) {
        let pendiente = false;
        const actualizar = () => { const total = raiz.scrollHeight - innerHeight, porcentaje = total > 0 ? Math.max(0, Math.min(100, scrollY / total * 100)) : 100; barra.style.width = `${porcentaje}%`; barra.setAttribute('aria-valuenow', String(Math.round(porcentaje))); pendiente = false; };
        const solicitar = () => {
            if (!pendiente) {
                pendiente = true;
                requestAnimationFrame(actualizar);
            }
        };
        addEventListener('scroll', solicitar, { passive: true });
        addEventListener('resize', solicitar);
        actualizar();
    }
});