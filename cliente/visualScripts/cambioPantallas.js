const botonCarpeta = document.getElementById("elegirCarpeta");
const pantallaUno = document.querySelector(".pantallaUno");
const pantallaDos = document.querySelector(".pantallaDos");
const listaProyectos = document.getElementById("listaProyectos");

async function mostrarProyectos(carpeta) {
    listaProyectos.innerHTML = "";

    let hayProyectos = false;

    for await (const [nombre, entrada] of carpeta.entries()) {
        if (entrada.kind !== "directory") {
            continue;
        }

        hayProyectos = true;

        await Estado.guardarProyectoHandle(
            nombre,
            entrada
        );

        const proyecto = document.createElement("div");

        proyecto.className = "filaProyecto";

        proyecto.innerHTML = `
            <span>${nombre}</span>
            <span>Sin descripción</span>
            <span>—</span>
            <span>—</span>
        `;

        proyecto.addEventListener("click", async () => {
            try {
                await Estado.guardarProyecto(nombre);

                window.location.href =
                    "IDE/editor.html";

            } catch (error) {
                console.error(
                    "No se pudo abrir el proyecto:",
                    error
                );
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

async function seleccionarCarpeta() {
    try {
        if (!window.showDirectoryPicker) {
            console.error(
                "Tu navegador no permite seleccionar carpetas."
            );
            return;
        }

        const carpeta =
            await window.showDirectoryPicker({
                mode: "readwrite"
            });

        console.log(
            "Carpeta seleccionada:",
            carpeta.name
        );

        await Estado.guardarCarpeta(carpeta);

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
}

async function recuperarCarpeta() {
    try {
        const carpeta =
            await Estado.obtenerCarpeta();

        if (!carpeta) {
            return;
        }

        const permiso =
            await carpeta.queryPermission({
                mode: "readwrite"
            });

        if (permiso !== "granted") {
            console.log(
                "Se necesita volver a autorizar la carpeta."
            );
            return;
        }

        await mostrarProyectos(carpeta);

        pantallaUno.style.display = "none";
        pantallaDos.style.display = "block";

    } catch (error) {
        console.error(
            "No se pudo recuperar la carpeta:",
            error
        );
    }
}

botonCarpeta.addEventListener(
    "click",
    seleccionarCarpeta
);

recuperarCarpeta();