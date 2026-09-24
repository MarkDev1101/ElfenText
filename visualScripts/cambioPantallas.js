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

        fila.innerHTML = `
            <span>${archivo.name}</span>
            <span>${archivo.webkitRelativePath}</span>
            <span>-</span>
            <span>-</span>
        `;

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