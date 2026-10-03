const {
    analizarProyecto
} = require("./analizadorProyecto");

async function iniciar() {
    const resultado =
        await analizarProyecto(
            "../proyectos_temporales/proyecto_1791060413995"
        );

    console.log(resultado);
}

iniciar();