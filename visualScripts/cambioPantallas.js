const botonCarpeta = document.getElementById("elegirCarpeta");
const selectorCarpeta = document.getElementById("selectorCarpeta");

const pantallaUno = document.querySelector(".pantallaUno");
const pantallaDos = document.querySelector(".pantallaDos");

const listaProyectos = document.getElementById("listaProyectos");
const mensajeSinProyectos = document.getElementById("mensajeSinProyectos");

botonCarpeta.addEventListener("click", () => {
    selectorCarpeta.click();
});

selectorCarpeta.addEventListener("change", () => {
    const archivos = selectorCarpeta.files;

    listaProyectos.innerHTML = "";

    console.log("Archivos encontrados:");

    for (const archivo of archivos) {
        console.log(archivo.webkitRelativePath);

        const fila = document.createElement("div");
        fila.classList.add("filaProyecto");

        const titulo = document.createElement("span");
        titulo.textContent = archivo.name;

        const descripcion = document.createElement("span");
        descripcion.textContent = archivo.webkitRelativePath;

        const creacion = document.createElement("span");
        creacion.textContent = "—";

        const modificacion = document.createElement("span");
        modificacion.textContent =
            new Date(archivo.lastModified).toLocaleDateString("es-MX");

        fila.appendChild(titulo);
        fila.appendChild(descripcion);
        fila.appendChild(creacion);
        fila.appendChild(modificacion);

        listaProyectos.appendChild(fila);
    }

    if (archivos.length === 0) {
        mensajeSinProyectos.style.display = "block";
    } else {
        mensajeSinProyectos.style.display = "none";
    }

    pantallaUno.classList.add("oculta");
    pantallaDos.classList.add("visible");
});