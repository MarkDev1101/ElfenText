const fs = require("fs/promises");
const path = require("path");

async function analizarProyecto(
    carpetaProyecto
) {
    const resultado = {
        archivoPrincipal: null,
        archivosTex: [],
        bibliografias: [],
        estilos: [],
        imagenes: []
    };

    await recorrerCarpeta(
        carpetaProyecto,
        "",
        resultado
    );

    return resultado;
}

async function recorrerCarpeta(
    carpeta,
    rutaActual,
    resultado
) {
    const entradas =
        await fs.readdir(
            carpeta,
            {
                withFileTypes: true
            }
        );

    for (const entrada of entradas) {
        const rutaCompleta =
            path.join(
                carpeta,
                entrada.name
            );

        const rutaRelativa =
            rutaActual
                ? path.join(
                      rutaActual,
                      entrada.name
                  )
                : entrada.name;

        if (entrada.isDirectory()) {
            await recorrerCarpeta(
                rutaCompleta,
                rutaRelativa,
                resultado
            );

            continue;
        }

        analizarArchivo(
            rutaRelativa,
            resultado
        );
    }
}

function analizarArchivo(
    rutaArchivo,
    resultado
) {
    const extension =
        path.extname(
            rutaArchivo
        ).toLowerCase();

    if (extension === ".tex") {
        resultado.archivosTex.push(
            rutaArchivo
        );

        return;
    }

    if (extension === ".bib") {
        resultado.bibliografias.push(
            rutaArchivo
        );

        return;
    }

    if (
        extension === ".sty" ||
        extension === ".cls"
    ) {
        resultado.estilos.push(
            rutaArchivo
        );

        return;
    }

    if (
        extension === ".png" ||
        extension === ".jpg" ||
        extension === ".jpeg" ||
        extension === ".gif" ||
        extension === ".webp" ||
        extension === ".svg"
    ) {
        resultado.imagenes.push(
            rutaArchivo
        );
    }
}

module.exports = {
    analizarProyecto
};