const botonCarpeta = document.getElementById("elegirCarpeta");
const pantallaUno = document.querySelector(".pantallaUno");
const pantallaDos = document.querySelector(".pantallaDos");
const listaProyectos = document.getElementById("listaProyectos");

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

async function guardarProyecto(nombre, handle) {
    const db = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("proyectos", "readwrite");
        transaction.objectStore("proyectos").put(handle, nombre);

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
    });
}

async function mostrarProyectos(carpeta) {
    listaProyectos.innerHTML = "";

    let hayProyectos = false;

    for await (const [nombre, entrada] of carpeta.entries()) {
        if (entrada.kind !== "directory") {
            continue;
        }

        hayProyectos = true;

        const proyecto = document.createElement("div");
        proyecto.className = "filaProyecto";

        proyecto.innerHTML = `
            <span>📁 ${nombre}</span>
            <span>Sin descripción</span>
            <span>—</span>
            <span>—</span>
        `;

        proyecto.addEventListener("click", async () => {
            try {
                await guardarProyecto(nombre, entrada);
                sessionStorage.setItem("proyectoActual", nombre);

                window.location.href = "IDE/editor.html";
            } catch (error) {
                console.error("No se pudo abrir el proyecto:", error);
            }
        });

        listaProyectos.appendChild(proyecto);
    }

    if (!hayProyectos) {
        listaProyectos.innerHTML = `
            <div class="sinProyectos">
                No hay proyectos en esta carpeta.
            </div>
        `;
    }
}

botonCarpeta.addEventListener("click", async () => {
    try {
        if (!window.showDirectoryPicker) {
            console.error(
                "Tu navegador no permite seleccionar carpetas."
            );
            return;
        }

        const carpeta = await window.showDirectoryPicker({
            mode: "readwrite"
        });

        console.log("Carpeta seleccionada:", carpeta.name);

        await mostrarProyectos(carpeta);

        pantallaUno.style.display = "none";
        pantallaDos.style.display = "block";

    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Selección cancelada.");
            return;
        }

        console.error(
            "Error al seleccionar la carpeta:",
            error
        );
    }
});