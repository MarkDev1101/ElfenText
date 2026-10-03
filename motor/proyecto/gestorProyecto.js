const fs = require("fs/promises");
const path = require("path");

async function reconstruirProyecto(
    proyectoRecibido
) {
    const carpetaTemporal =
        path.join(
            __dirname,
            "..",
            "proyectos_temporales",
            `proyecto_${Date.now()}`
        );

    await fs.mkdir(
        carpetaTemporal,
        {
            recursive: true
        }
    );

    for (
        const archivo of proyectoRecibido.archivos
    ) {
        const rutaArchivo =
            path.join(
                carpetaTemporal,
                archivo.nombre
            );

        const carpetaArchivo =
            path.dirname(
                rutaArchivo
            );

        await fs.mkdir(
            carpetaArchivo,
            {
                recursive: true
            }
        );

        const contenido =
            Buffer.from(
                archivo.contenido,
                "base64"
            );

        await fs.writeFile(
            rutaArchivo,
            contenido
        );
    }

    return carpetaTemporal;
}

module.exports = {
    reconstruirProyecto
};