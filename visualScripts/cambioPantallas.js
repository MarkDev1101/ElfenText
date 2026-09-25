const botonCarpeta = document.getElementById("elegirCarpeta");
const pantallaUno = document.querySelector(".pantallaUno");
const pantallaDos = document.querySelector(".pantallaDos");
const listaProyectos = document.getElementById("listaProyectos");

botonCarpeta.addEventListener("click", async () => {
    try {
        if (!window.showDirectoryPicker) {
            console.error("Tu navegador no permite seleccionar carpetas.");
            return;
        }

        const carpeta = await window.showDirectoryPicker();

        listaProyectos.innerHTML = "";

        for await (const [nombre, entrada] of carpeta.entries()) {
            if (entrada.kind !== "directory") {
                continue;
            }

            const proyecto = document.createElement("div");

            proyecto.className = "filaProyecto";

            proyecto.innerHTML = `
                <span>📁 ${nombre}</span>
                <span>Sin descripción</span>
                <span>—</span>
                <span>—</span>
            `;

            proyecto.addEventListener("click", () => {
                sessionStorage.setItem("proyectoActual", nombre);
                window.location.href = "IDE/editor.html";
            });

            listaProyectos.appendChild(proyecto);
        }

        pantallaUno.classList.add("oculta");
        pantallaDos.classList.add("visible");

        console.log("Carpeta seleccionada:", carpeta.name);

    } catch (error) {
        console.error("Error al seleccionar la carpeta:", error);
    }
});