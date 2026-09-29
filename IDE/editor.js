let proyecto = null;
let carpetaSeleccionada = null;
let archivoActual = null;
let carpetaArchivoActual = null;
let rutaActual = [];

const $ = id => document.getElementById(id);

const nombreProyecto = $("nombreProyecto");
const listaArchivos = $("listaArchivos");
const editorTexto = $("editorTexto");
const nombreArchivo = $("nombreArchivo");
const numerosLinea = $("numerosLinea");
const rutaProyecto = $("rutaProyecto");

function cerrarMenuContextual() {
    menuContextual?.classList.remove(
        "visible"
    );

    elementoContextual = null;
    handleContextual = null;
    carpetaContextual = null;
    tipoContextual = null;
}

function mostrarMenuContextual(
    evento,
    elemento,
    handle,
    tipo,
    carpetaPadre = null
) {
    evento.preventDefault();
    evento.stopPropagation();

    elementoContextual = elemento;
    handleContextual = handle;
    tipoContextual = tipo;
    carpetaContextual = carpetaPadre;

    menuContextual.style.left =
        `${evento.clientX}px`;

    menuContextual.style.top =
        `${evento.clientY}px`;

    menuContextual.classList.add(
        "visible"
    );
}

function aplicarTema() {
    document.body.classList.toggle(
        "tema-oscuro",
        Estado.obtenerTema() === "oscuro"
    );
}

function actualizarLineas() {
    if (!numerosLinea) return;

    const lineas = editorTexto.value.split("\n").length;

    numerosLinea.innerHTML = Array.from(
        { length: lineas },
        (_, i) => i + 1
    ).join("<br>");
}

editorTexto.addEventListener(
    "input",
    actualizarLineas
);

editorTexto.addEventListener(
    "scroll",
    () => {
        if (numerosLinea) {
            numerosLinea.scrollTop =
                editorTexto.scrollTop;
        }
    }
);

async function cargarProyecto() {
    try {
        const nombre =
            Estado.obtenerProyecto();

        if (!nombre) {
            nombreProyecto.textContent =
                "Sin proyecto";
            return;
        }

        proyecto =
            await Estado.obtenerProyectoHandle(
                nombre
            );

        if (!proyecto) {
            nombreProyecto.textContent =
                "Proyecto no encontrado";
            return;
        }

        nombreProyecto.textContent = nombre;

        carpetaSeleccionada = proyecto;

        rutaActual = [
            {
                nombre,
                handle: proyecto
            }
        ];

        actualizarRuta();

        await construirExplorador();

    } catch (error) {
        console.error(
            "Error al cargar proyecto:",
            error
        );
    }
}

function actualizarRuta() {
    if (!rutaProyecto) return;

    rutaProyecto.textContent =
        rutaActual
            .map(item => item.nombre)
            .join(" / ");
}

async function obtenerEntradas(carpeta) {
    const entradas = [];

    for await (
        const [nombre, handle]
        of carpeta.entries()
    ) {
        entradas.push({
            nombre,
            handle
        });
    }

    return entradas.sort((a, b) => {
        if (
            a.handle.kind !== b.handle.kind
        ) {
            return a.handle.kind ===
                "directory"
                ? -1
                : 1;
        }

        return a.nombre.localeCompare(
            b.nombre,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );
    });
}

async function construirExplorador() {
    listaArchivos.innerHTML = "";

    const raiz =
        crearNodoCarpeta(
            proyecto,
            nombreProyecto.textContent,
            true
        );

    listaArchivos.appendChild(raiz);

    const contenido =
        raiz.querySelector(
            ":scope > .contenidoCarpeta"
        );

    contenido.style.display = "block";

    raiz.querySelector(
        ":scope > .filaExplorador .flechaCarpeta"
    ).textContent = "▼";

    await cargarContenido(
        proyecto,
        contenido
    );
}

function crearNodoCarpeta(
    handle,
    nombre,
    esRaiz = false
) {
    const nodo =
        document.createElement("div");

    nodo.className = esRaiz
        ? "nodoProyecto"
        : "nodoCarpeta";

    nodo.handle = handle;

    const fila =
        document.createElement("div");

    fila.className =
        "filaExplorador";

    const flecha =
        document.createElement("button");

    flecha.type = "button";
    flecha.className =
        "flechaCarpeta";
    flecha.textContent = "▶";

    const texto =
        document.createElement("span");

    texto.className =
        "nombreExplorador";

    texto.textContent =
        "📁 " + nombre;

    fila.append(
        flecha,
        texto
    );

    const contenido =
        document.createElement("div");

    contenido.className =
        "contenidoCarpeta";

    contenido.style.display =
        "none";

    nodo.append(
        fila,
        contenido
    );

    fila.addEventListener(
        "contextmenu",
        evento => {
            mostrarMenuContextual(
                evento,
                nodo,
                handle,
                "carpeta"
            );
        }
    );

    fila.addEventListener(
        "click",
        async evento => {
            evento.stopPropagation();

            seleccionarCarpeta(
                handle,
                nombre,
                fila
            );

            const abierta =
                contenido.style.display !==
                "none";

            contenido.style.display =
                abierta ? "none" : "block";

            flecha.textContent =
                abierta ? "▶" : "▼";

            if (!abierta) {
                await cargarContenido(
                    handle,
                    contenido
                );
            }
        }
    );

    return nodo;
}

async function cargarContenido(
    carpeta,
    contenedor
) {
    contenedor.innerHTML = "";

    const entradas =
        await obtenerEntradas(carpeta);

    if (!entradas.length) {
        const vacio =
            document.createElement("div");

        vacio.className =
            "carpetaVacia";

        vacio.textContent =
            "Carpeta vacía";

        contenedor.appendChild(vacio);
        return;
    }

    for (const item of entradas) {
        if (
            item.handle.kind ===
            "directory"
        ) {
            contenedor.appendChild(
                crearNodoCarpeta(
                    item.handle,
                    item.nombre
                )
            );
        } else {
            contenedor.appendChild(
                crearNodoArchivo(
                    item.handle,
                    item.nombre,
                    carpeta
                )
            );
        }
    }
}

function crearNodoArchivo(
    handle,
    nombre,
    carpetaPadre
) {
    const fila =
        document.createElement("div");

    fila.className =
        "filaArchivo";

    fila.handle = handle;
    fila.carpetaPadre =
        carpetaPadre;
    fila.nombre = nombre;

    const texto =
        document.createElement("span");

    texto.className =
        "nombreExplorador";

    texto.textContent =
        "📄 " + nombre;

    fila.appendChild(texto);

    fila.addEventListener(
        "click",
        async evento => {
            evento.stopPropagation();

            seleccionarArchivo(
                handle,
                carpetaPadre,
                fila
            );

            await abrirArchivo(
                handle,
                nombre,
                carpetaPadre
            );
        }
    );

    fila.addEventListener(
        "contextmenu",
        evento => {
            mostrarMenuContextual(
                evento,
                fila,
                handle,
                "archivo",
                carpetaPadre
            );
        }
    );

    return fila;
}

function limpiarSeleccion() {
    document
        .querySelectorAll(
            ".seleccionado"
        )
        .forEach(elemento => {
            elemento.classList.remove(
                "seleccionado"
            );
        });
}

function seleccionarCarpeta(
    handle,
    nombre,
    elemento
) {
    limpiarSeleccion();

    elemento.classList.add(
        "seleccionado"
    );

    carpetaSeleccionada =
        handle;

    archivoActual = null;
    carpetaArchivoActual = null;

    nombreArchivo.textContent =
        "Ningún archivo abierto";

    const posicion =
        rutaActual.findIndex(
            item =>
                item.handle === handle
        );

    if (posicion !== -1) {
        rutaActual =
            rutaActual.slice(
                0,
                posicion + 1
            );
    } else {
        rutaActual.push({
            nombre,
            handle
        });
    }

    actualizarRuta();
}

function seleccionarArchivo(
    handle,
    carpetaPadre,
    elemento
) {
    limpiarSeleccion();

    elemento.classList.add(
        "seleccionado"
    );

    archivoActual = handle;
    carpetaArchivoActual =
        carpetaPadre;

    carpetaSeleccionada =
        carpetaPadre;
}

async function abrirArchivo(
    handle,
    nombre,
    carpetaPadre
) {
    try {
        let permiso =
            await handle.queryPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") {
            permiso =
                await handle.requestPermission({
                    mode: "readwrite"
                });
        }

        if (permiso !== "granted") return;

        const archivo =
            await handle.getFile();

        editorTexto.value =
            await archivo.text();

        nombreArchivo.textContent =
            nombre;

        archivoActual = handle;
        carpetaArchivoActual =
            carpetaPadre;

        actualizarLineas();

    } catch (error) {
        console.error(
            "Error al abrir archivo:",
            error
        );
    }
}

async function guardarArchivo() {
    if (!archivoActual) return;

    try {
        const permiso =
            await archivoActual.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") return;

        const writable =
            await archivoActual.createWritable();

        await writable.write(
            editorTexto.value
        );

        await writable.close();

        console.log(
            "Archivo guardado."
        );

    } catch (error) {
        console.error(
            "Error al guardar:",
            error
        );
    }
}

async function crearArchivo() {
    if (!carpetaSeleccionada) {
        alert(
            "Selecciona una carpeta."
        );
        return;
    }

    const nombre =
        prompt("Nombre del archivo:");

    if (!nombre) return;

    try {
        const permiso =
            await carpetaSeleccionada.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") return;

        await carpetaSeleccionada.getFileHandle(
            nombre,
            { create: true }
        );

        await refrescarCarpeta(
            carpetaSeleccionada
        );

    } catch (error) {
        console.error(
            "Error al crear archivo:",
            error
        );
    }
}

async function crearCarpeta() {
    if (!carpetaSeleccionada) {
        alert(
            "Selecciona una carpeta."
        );
        return;
    }

    const nombre =
        prompt("Nombre de la carpeta:");

    if (!nombre) return;

    try {
        const permiso =
            await carpetaSeleccionada.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") return;

        await carpetaSeleccionada.getDirectoryHandle(
            nombre,
            { create: true }
        );

        await refrescarCarpeta(
            carpetaSeleccionada
        );

    } catch (error) {
        console.error(
            "Error al crear carpeta:",
            error
        );
    }
}

async function refrescarCarpeta(handle) {
    const nodo =
        buscarNodoCarpeta(handle);

    if (!nodo) {
        await construirExplorador();
        return;
    }

    const contenido =
        nodo.querySelector(
            ":scope > .contenidoCarpeta"
        );

    const flecha =
        nodo.querySelector(
            ":scope > .filaExplorador .flechaCarpeta"
        );

    contenido.style.display =
        "block";

    flecha.textContent =
        "▼";

    await cargarContenido(
        handle,
        contenido
    );
}

function buscarNodoCarpeta(handle) {
    const nodos =
        document.querySelectorAll(
            ".nodoProyecto, .nodoCarpeta"
        );

    return [...nodos].find(
        nodo => nodo.handle === handle
    );
}

async function eliminarArchivo() {
    if (!archivoActual) {
        alert(
            "Selecciona un archivo."
        );
        return;
    }

    const nombre =
        nombreArchivo.textContent;

    if (
        !confirm(
            `¿Eliminar "${nombre}"?`
        )
    ) {
        return;
    }

    try {
        const permiso =
            await carpetaArchivoActual.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") return;

        await carpetaArchivoActual.removeEntry(
            nombre
        );

        archivoActual = null;
        carpetaArchivoActual = null;

        editorTexto.value = "";

        nombreArchivo.textContent =
            "Ningún archivo abierto";

        actualizarLineas();

        await refrescarCarpeta(
            carpetaSeleccionada
        );

    } catch (error) {
        console.error(
            "Error al eliminar:",
            error
        );
    }
}

async function eliminarCarpeta() {
    if (
        !carpetaSeleccionada ||
        carpetaSeleccionada === proyecto
    ) {
        alert(
            "Selecciona una carpeta válida."
        );
        return;
    }

    const indice =
        rutaActual.findIndex(
            item =>
                item.handle ===
                carpetaSeleccionada
        );

    if (indice <= 0) return;

    const nombre =
        rutaActual[indice].nombre;

    const padre =
        rutaActual[indice - 1].handle;

    if (
        !confirm(
            `¿Eliminar "${nombre}" y todo su contenido?`
        )
    ) {
        return;
    }

    try {
        const permiso =
            await padre.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") return;

        await padre.removeEntry(
            nombre,
            { recursive: true }
        );

        carpetaSeleccionada =
            padre;

        rutaActual =
            rutaActual.slice(
                0,
                indice
            );

        actualizarRuta();

        archivoActual = null;
        carpetaArchivoActual = null;

        editorTexto.value = "";

        nombreArchivo.textContent =
            "Ningún archivo abierto";

        actualizarLineas();

        await refrescarCarpeta(
            padre
        );

    } catch (error) {
        console.error(
            "Error al eliminar carpeta:",
            error
        );
    }
}

$("guardarArchivo")?.addEventListener(
    "click",
    guardarArchivo
);

$("nuevoArchivo")?.addEventListener(
    "click",
    crearArchivo
);

$("nuevaCarpeta")?.addEventListener(
    "click",
    crearCarpeta
);

$("eliminarArchivo")?.addEventListener(
    "click",
    eliminarArchivo
);

$("eliminarCarpeta")?.addEventListener(
    "click",
    eliminarCarpeta
);

$("cerrarProyecto")?.addEventListener(
    "click",
    () => {
        window.location.href =
            "../index.html";
    }
);

const botonPersonalizar =
    $("botonPersonalizar");

const ventanaPersonalizar =
    $("ventanaPersonalizar");

const cerrarPersonalizar =
    $("cerrarPersonalizar");

botonPersonalizar?.addEventListener(
    "click",
    () => {
        ventanaPersonalizar?.classList.toggle(
            "visible"
        );
    }
);

cerrarPersonalizar?.addEventListener(
    "click",
    () => {
        ventanaPersonalizar?.classList.remove(
            "visible"
        );
    }
);

$("temaClaro")?.addEventListener(
    "click",
    () => {
        Estado.guardarTema("claro");
        aplicarTema();
    }
);

$("temaOscuro")?.addEventListener(
    "click",
    () => {
        Estado.guardarTema("oscuro");
        aplicarTema();
    }
);

contextNuevoArchivo?.addEventListener(
    "click",
    async () => {
        cerrarMenuContextual();

        if (
            tipoContextual !== "carpeta"
        ) {
            return;
        }

        const nombre =
            prompt(
                "Nombre del archivo:"
            );

        if (!nombre) return;

        try {
            const permiso =
                await handleContextual
                    .requestPermission({
                        mode: "readwrite"
                    });

            if (permiso !== "granted") {
                return;
            }

            await handleContextual
                .getFileHandle(
                    nombre,
                    {
                        create: true
                    }
                );

            await refrescarCarpeta(
                handleContextual
            );

        } catch (error) {
            console.error(
                "No se pudo crear el archivo:",
                error
            );
        }
    }
);

contextRenombrar?.addEventListener(
    "click",
    async () => {
        const tipo =
            tipoContextual;

        const handle =
            handleContextual;

        cerrarMenuContextual();

        if (!handle) return;

        const nombreActual =
            handle.name;

        const nuevoNombre =
            prompt(
                "Nuevo nombre:",
                nombreActual
            );

        if (
            !nuevoNombre ||
            nuevoNombre === nombreActual
        ) {
            return;
        }

        try {
            if (tipo === "archivo") {
                await renombrarArchivo(
                    handle,
                    nuevoNombre,
                    carpetaContextual
                );
            }

            if (tipo === "carpeta") {
                await renombrarCarpeta(
                    handle,
                    nuevoNombre
                );
            }

        } catch (error) {
            console.error(
                "No se pudo renombrar:",
                error
            );
        }
    }
);

aplicarTema();
actualizarLineas();
cargarProyecto();