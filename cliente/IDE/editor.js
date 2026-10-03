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

function aplicarTema() {
    document.body.classList.toggle(
        "tema-oscuro",
        Estado.obtenerTema() === "oscuro"
    );
}

function actualizarLineas() {
    if (!numerosLinea) return;

    const cantidad =
        editorTexto.value.split("\n").length;

    numerosLinea.innerHTML =
        Array.from(
            { length: cantidad },
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

        nombreProyecto.textContent =
            nombre;

        carpetaSeleccionada =
            proyecto;

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
            a.handle.kind !==
            b.handle.kind
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

    contenido.style.display =
        "block";

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
    nodo.nombre = nombre;

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
            "Error al eliminar archivo:",
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
            {
                recursive: true
            }
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

$("cerrarProyecto")?.addEventListener(
    "click",
    () => {
        window.location.href =
            "../index.html";
    }
);

async function obtenerArchivosProyecto(
    carpeta,
    ruta = ""
) {
    const archivos = [];

    for await (
        const [nombre, entrada]
        of carpeta.entries()
    ) {
        const rutaArchivo =
            ruta
                ? `${ruta}/${nombre}`
                : nombre;

        if (entrada.kind === "file") {
            const archivo =
                await entrada.getFile();

            const contenido =
                await archivo.arrayBuffer();

            archivos.push({
                nombre: rutaArchivo,
                contenido: contenido
            });

        } else if (
            entrada.kind === "directory"
        ) {
            const archivosCarpeta =
                await obtenerArchivosProyecto(
                    entrada,
                    rutaArchivo
                );

            archivos.push(
                ...archivosCarpeta
            );
        }
    }

    return archivos;
}

function convertirArrayBufferABase64(buffer) {
    let binario = "";

    const bytes =
        new Uint8Array(buffer);

    const tamañoBloque = 8192;

    for (
        let inicio = 0;
        inicio < bytes.length;
        inicio += tamañoBloque
    ) {
        const bloque =
            bytes.subarray(
                inicio,
                inicio + tamañoBloque
            );

        binario += String.fromCharCode(
            ...bloque
        );
    }

    return btoa(binario);
}

async function compilarProyecto() {
    try {
        const archivos =
            await obtenerArchivosProyecto(
                proyecto
            );

        const archivosCodificados =
            archivos.map(archivo => ({
                nombre: archivo.nombre,
                contenido:
                    convertirArrayBufferABase64(
                        archivo.contenido
                    )
            }));

        const proyectoEnviar = {
            archivos: archivosCodificados
        };

        const respuesta =
            await fetch(
                "http://localhost:3000/compile",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        proyectoEnviar
                    )
                }
            );

        const resultado =
            await respuesta.json();

        console.log(
            "Respuesta del motor:",
            resultado
        );

    } catch (error) {
        console.error(
            "Error al enviar proyecto:",
            error
        );
    }
}

$("compilarProyecto")?.addEventListener(
    "click",
    compilarProyecto
);

aplicarTema();
actualizarLineas();
cargarProyecto();