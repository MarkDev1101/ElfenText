let proyecto = null;
let archivoActual = null;

const nombreProyecto = document.getElementById("nombreProyecto");
const listaArchivos = document.getElementById("listaArchivos");
const editorTexto = document.getElementById("editorTexto");
const nombreArchivo = document.getElementById("nombreArchivo");
const numerosLinea = document.getElementById("numerosLinea");

function aplicarTema() {
    const tema = localStorage.getItem("tema");

    document.body.classList.toggle(
        "tema-oscuro",
        tema === "oscuro"
    );
}

function actualizarLineas() {
    const cantidad = editorTexto.value.split("\n").length;

    numerosLinea.innerHTML = Array.from(
        { length: cantidad },
        (_, i) => i + 1
    ).join("<br>");
}

editorTexto.addEventListener("input", actualizarLineas);

editorTexto.addEventListener("scroll", () => {
    numerosLinea.scrollTop = editorTexto.scrollTop;
});

function abrirBaseDatos() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ElfenTextDB", 1);

        request.onupgradeneeded = () => {
            request.result.createObjectStore("proyectos");
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function obtenerProyecto() {
    const db = await abrirBaseDatos();
    const nombre = sessionStorage.getItem("proyectoActual");

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "proyectos",
            "readonly"
        );

        const request = transaction
            .objectStore("proyectos")
            .get(nombre);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function cargarProyecto() {
    try {
        proyecto = await obtenerProyecto();

        if (!proyecto) {
            nombreProyecto.textContent = "Proyecto no encontrado";
            return;
        }

        nombreProyecto.textContent = proyecto.name;

        await mostrarArchivos(proyecto);

    } catch (error) {
        console.error(
            "No se pudo cargar el proyecto:",
            error
        );
    }
}

async function mostrarArchivos(
    carpeta,
    contenedor = listaArchivos
) {
    contenedor.innerHTML = "";

    for await (const [nombre, entrada] of carpeta.entries()) {

        const elemento = document.createElement("div");

        if (entrada.kind === "directory") {

            elemento.className = "carpeta";
            elemento.textContent = "📁 " + nombre;

            elemento.addEventListener("click", async () => {
                await mostrarArchivos(
                    entrada,
                    elemento
                );
            });

        } else {

            elemento.className = "archivo";
            elemento.textContent = "📄 " + nombre;

            elemento.addEventListener("click", () => {
                abrirArchivo(entrada, nombre);
            });
        }

        contenedor.appendChild(elemento);
    }
}

async function abrirArchivo(archivo, nombre) {
    try {
        let permiso = await archivo.queryPermission({
            mode: "readwrite"
        });

        if (permiso !== "granted") {
            permiso = await archivo.requestPermission({
                mode: "readwrite"
            });
        }

        if (permiso !== "granted") {
            return;
        }

        const file = await archivo.getFile();

        archivoActual = archivo;

        editorTexto.value = await file.text();
        nombreArchivo.textContent = nombre;

        actualizarLineas();

    } catch (error) {
        console.error(
            "No se pudo abrir el archivo:",
            error
        );
    }
}

async function guardarArchivo() {
    if (!archivoActual) {
        return;
    }

    try {
        const permiso = await archivoActual.requestPermission({
            mode: "readwrite"
        });

        if (permiso !== "granted") {
            return;
        }

        const writable =
            await archivoActual.createWritable();

        await writable.write(editorTexto.value);

        await writable.close();

        console.log("Archivo guardado.");

    } catch (error) {
        console.error(
            "No se pudo guardar:",
            error
        );
    }
}

async function crearArchivo() {
    if (!proyecto) {
        return;
    }

    const nombre = prompt(
        "Nombre del archivo:"
    );

    if (!nombre) {
        return;
    }

    try {
        const archivo =
            await proyecto.getFileHandle(
                nombre,
                { create: true }
            );

        const writable =
            await archivo.createWritable();

        await writable.write("");

        await writable.close();

        await mostrarArchivos(proyecto);

    } catch (error) {
        console.error(
            "No se pudo crear el archivo:",
            error
        );
    }
}

async function crearCarpeta() {
    if (!proyecto) {
        return;
    }

    const nombre = prompt(
        "Nombre de la carpeta:"
    );

    if (!nombre) {
        return;
    }

    try {
        await proyecto.getDirectoryHandle(
            nombre,
            { create: true }
        );

        await mostrarArchivos(proyecto);

    } catch (error) {
        console.error(
            "No se pudo crear la carpeta:",
            error
        );
    }
}

async function eliminarArchivo() {
    if (!archivoActual || !proyecto) {
        return;
    }

    const nombre =
        nombreArchivo.textContent;

    if (!confirm(
        `¿Eliminar "${nombre}"?`
    )) {
        return;
    }

    try {
        const permiso =
            await proyecto.requestPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") {
            return;
        }

        await proyecto.removeEntry(nombre);

        archivoActual = null;

        editorTexto.value = "";

        nombreArchivo.textContent =
            "Ningún archivo abierto";

        actualizarLineas();

        await mostrarArchivos(proyecto);

    } catch (error) {
        console.error(
            "No se pudo eliminar el archivo:",
            error
        );
    }
}

const botonEliminar =
    document.getElementById(
        "eliminarArchivo"
    );

if (botonEliminar) {
    botonEliminar.addEventListener(
        "click",
        eliminarArchivo
    );
}

document
    .getElementById("guardarArchivo")
    .addEventListener(
        "click",
        guardarArchivo
    );

document
    .getElementById("nuevoArchivo")
    .addEventListener(
        "click",
        crearArchivo
    );

document
    .getElementById("nuevaCarpeta")
    .addEventListener(
        "click",
        crearCarpeta
    );

document
    .getElementById("cerrarProyecto")
    .addEventListener(
        "click",
        () => {
            sessionStorage.removeItem(
                "proyectoActual"
            );

            window.location.href =
                "../index.html";
        }
    );

const botonPersonalizar =
    document.getElementById(
        "botonPersonalizar"
    );

const ventanaPersonalizar =
    document.getElementById(
        "ventanaPersonalizar"
    );

const cerrarPersonalizar =
    document.getElementById(
        "cerrarPersonalizar"
    );

if (
    botonPersonalizar &&
    ventanaPersonalizar
) {
    botonPersonalizar.addEventListener(
        "click",
        () => {
            ventanaPersonalizar
                .classList.toggle("visible");
        }
    );
}

if (cerrarPersonalizar) {
    cerrarPersonalizar.addEventListener(
        "click",
        () => {
            ventanaPersonalizar
                .classList.remove("visible");
        }
    );
}

const temaClaro =
    document.getElementById("temaClaro");

const temaOscuro =
    document.getElementById("temaOscuro");

if (temaClaro) {
    temaClaro.addEventListener(
        "click",
        () => {
            document.body.classList.remove(
                "tema-oscuro"
            );

            localStorage.setItem(
                "tema",
                "claro"
            );
        }
    );
}

if (temaOscuro) {
    temaOscuro.addEventListener(
        "click",
        () => {
            document.body.classList.add(
                "tema-oscuro"
            );

            localStorage.setItem(
                "tema",
                "oscuro"
            );
        }
    );
}

aplicarTema();
actualizarLineas();
cargarProyecto();