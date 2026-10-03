const botonPersonalizar = document.getElementById("botonPersonalizar");
const ventanaPersonalizar = document.getElementById("ventanaPersonalizar");
const cerrarPersonalizar = document.getElementById("cerrarPersonalizar");

const temaClaro = document.getElementById("temaClaro");
const temaOscuro = document.getElementById("temaOscuro");

botonPersonalizar.addEventListener("click", (evento) => {
    evento.stopPropagation();

    ventanaPersonalizar.classList.toggle("visible");
});

cerrarPersonalizar.addEventListener("click", (evento) => {
    evento.stopPropagation();

    ventanaPersonalizar.classList.remove("visible");
});

ventanaPersonalizar.addEventListener("click", (evento) => {
    evento.stopPropagation();
});

document.addEventListener("click", () => {
    ventanaPersonalizar.classList.remove("visible");
});

temaClaro.addEventListener("click", () => {
    Estado.guardarTema("claro");
    document.body.classList.remove("tema-oscuro");
});

temaOscuro.addEventListener("click", () => {
    Estado.guardarTema("oscuro");
    document.body.classList.add("tema-oscuro");
});

const temaGuardado = Estado.obtenerTema();

if (temaGuardado === "oscuro") {
    document.body.classList.add("tema-oscuro");
}