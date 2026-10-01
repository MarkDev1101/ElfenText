const menuArchivos =
    document.getElementById("menuArchivos");

const menuNuevoArchivo =
    document.getElementById("menuNuevoArchivo");

const menuNuevaCarpeta =
    document.getElementById("menuNuevaCarpeta");

const menuRenombrar =
    document.getElementById("menuRenombrar");

const menuEliminar =
    document.getElementById("menuEliminar");

const botonPersonalizar =
    document.getElementById("botonPersonalizar");

const ventanaPersonalizar =
    document.getElementById("ventanaPersonalizar");

const cerrarPersonalizar =
    document.getElementById("cerrarPersonalizar");

const temaClaro =
    document.getElementById("temaClaro");

const temaOscuro =
    document.getElementById("temaOscuro");

let elementoContextual = null;

function cerrarMenu() {
    if (!menuArchivos) return;

    menuArchivos.classList.remove(
        "visible"
    );

    elementoContextual = null;
}

function obtenerNombre(elemento) {
    if (elemento.nombre) {
        return elemento.nombre;
    }

    const texto =
        elemento.querySelector(
            ".nombreExplorador"
        );

    if (!texto) return "";

    return texto.textContent
        .replace("📁 ", "")
        .replace("📄 ", "")
        .trim();
}

document.addEventListener(
    "contextmenu",
    evento => {
        const archivo =
            evento.target.closest(
                ".filaArchivo"
            );

        const filaCarpeta =
            evento.target.closest(
                ".filaExplorador"
            );

        let elemento = null;

        if (archivo) {
            elemento = archivo;
        } else if (filaCarpeta) {
            elemento =
                filaCarpeta.parentElement;
        }

        if (!elemento) return;

        evento.preventDefault();

        elementoContextual =
            elemento;

        const esArchivo =
            elemento.classList.contains(
                "filaArchivo"
            );

        elementoContextual.tipo =
            esArchivo
                ? "archivo"
                : "carpeta";

        elementoContextual.nombre =
            obtenerNombre(elemento);

        elementoContextual.handle =
            elemento.handle;

        elementoContextual.carpetaPadre =
            elemento.carpetaPadre ||
            null;

        menuArchivos.style.left =
            `${evento.clientX}px`;

        menuArchivos.style.top =
            `${evento.clientY}px`;

        menuArchivos.classList.add(
            "visible"
        );
    }
);

document.addEventListener(
    "click",
    evento => {
        if (
            menuArchivos &&
            !menuArchivos.contains(
                evento.target
            )
        ) {
            cerrarMenu();
        }

        if (
            ventanaPersonalizar &&
            ventanaPersonalizar.classList.contains(
                "visible"
            ) &&
            !ventanaPersonalizar.contains(
                evento.target
            ) &&
            !botonPersonalizar?.contains(
                evento.target
            )
        ) {
            ventanaPersonalizar.classList.remove(
                "visible"
            );
        }
    }
);

menuNuevoArchivo?.addEventListener(
    "click",
    async () => {
        if (!elementoContextual) return;

        if (
            elementoContextual.tipo ===
            "carpeta"
        ) {
            carpetaSeleccionada =
                elementoContextual.handle;
        } else {
            carpetaSeleccionada =
                elementoContextual.carpetaPadre;
        }

        cerrarMenu();

        await crearArchivo();
    }
);

menuNuevaCarpeta?.addEventListener(
    "click",
    async () => {
        if (!elementoContextual) return;

        if (
            elementoContextual.tipo ===
            "carpeta"
        ) {
            carpetaSeleccionada =
                elementoContextual.handle;
        } else {
            carpetaSeleccionada =
                elementoContextual.carpetaPadre;
        }

        cerrarMenu();

        await crearCarpeta();
    }
);

menuEliminar?.addEventListener(
    "click",
    async () => {
        if (!elementoContextual) return;

        const elemento =
            elementoContextual;

        cerrarMenu();

        if (
            elemento.tipo ===
            "archivo"
        ) {
            archivoActual =
                elemento.handle;

            carpetaArchivoActual =
                elemento.carpetaPadre;

            const nombre =
                elemento.nombre;

            if (
                !confirm(
                    `¿Eliminar "${nombre}"?`
                )
            ) {
                return;
            }

            try {
                await carpetaArchivoActual.removeEntry(
                    nombre
                );

                archivoActual = null;
                carpetaArchivoActual = null;

                editorTexto.value = "";

                nombreArchivo.textContent =
                    "Ningún archivo abierto";

                actualizarLineas();

                await refrescarCarpeta(
                    carpetaSeleccionada
                );

            } catch (error) {
                console.error(
                    "Error al eliminar archivo:",
                    error
                );
            }

            return;
        }

        if (
            elemento.tipo ===
            "carpeta"
        ) {
            if (
                elemento.handle ===
                proyecto
            ) {
                alert(
                    "No puedes eliminar el proyecto desde aquí."
                );
                return;
            }

            const nombre =
                elemento.nombre;

            const padre =
                encontrarPadreCarpeta(
                    elemento.handle
                );

            if (!padre) {
                alert(
                    "No se encontró la carpeta padre."
                );
                return;
            }

            if (
                !confirm(
                    `¿Eliminar "${nombre}" y todo su contenido?`
                )
            ) {
                return;
            }

            try {
                await padre.removeEntry(
                    nombre,
                    {
                        recursive: true
                    }
                );

                carpetaSeleccionada =
                    padre;

                await refrescarCarpeta(
                    padre
                );

            } catch (error) {
                console.error(
                    "Error al eliminar carpeta:",
                    error
                );
            }
        }
    }
);

menuRenombrar?.addEventListener(
    "click",
    async () => {
        if (!elementoContextual) return;

        const elemento =
            elementoContextual;

        cerrarMenu();

        const nuevoNombre =
            prompt(
                "Nuevo nombre:",
                elemento.nombre
            );

        if (
            !nuevoNombre ||
            nuevoNombre ===
                elemento.nombre
        ) {
            return;
        }

        const padre =
            elemento.tipo ===
                "archivo"
                ? elemento.carpetaPadre
                : encontrarPadreCarpeta(
                      elemento.handle
                  );

        if (!padre) {
            alert(
                "No se encontró la carpeta padre."
            );
            return;
        }

        try {
            if (
                elemento.tipo ===
                "archivo"
            ) {
                const archivo =
                    await elemento.handle.getFile();

                const nuevoArchivo =
                    await padre.getFileHandle(
                        nuevoNombre,
                        {
                            create: true
                        }
                    );

                const writable =
                    await nuevoArchivo.createWritable();

                await writable.write(
                    await archivo.arrayBuffer()
                );

                await writable.close();

                await padre.removeEntry(
                    elemento.nombre
                );

            } else {
                const nuevaCarpeta =
                    await padre.getDirectoryHandle(
                        nuevoNombre,
                        {
                            create: true
                        }
                    );

                await copiarCarpeta(
                    elemento.handle,
                    nuevaCarpeta
                );

                await padre.removeEntry(
                    elemento.nombre,
                    {
                        recursive: true
                    }
                );
            }

            await refrescarCarpeta(
                padre
            );

        } catch (error) {
            console.error(
                "Error al renombrar:",
                error
            );
        }
    }
);

function encontrarPadreCarpeta(
    handle
) {
    const nodos =
        document.querySelectorAll(
            ".nodoProyecto, .nodoCarpeta"
        );

    for (const nodo of nodos) {
        const contenido =
            nodo.querySelector(
                ":scope > .contenidoCarpeta"
            );

        if (!contenido) continue;

        for (
            const hijo of contenido.children
        ) {
            if (
                hijo.handle ===
                handle
            ) {
                return nodo.handle;
            }
        }
    }

    return null;
}

async function copiarCarpeta(
    origen,
    destino
) {
    for await (
        const [nombre, entrada]
        of origen.entries()
    ) {
        if (
            entrada.kind ===
            "file"
        ) {
            const archivo =
                await entrada.getFile();

            const nuevoArchivo =
                await destino.getFileHandle(
                    nombre,
                    {
                        create: true
                    }
                );

            const writable =
                await nuevoArchivo.createWritable();

            await writable.write(
                await archivo.arrayBuffer()
            );

            await writable.close();

        } else {
            const nuevaCarpeta =
                await destino.getDirectoryHandle(
                    nombre,
                    {
                        create: true
                    }
                );

            await copiarCarpeta(
                entrada,
                nuevaCarpeta
            );
        }
    }
}

botonPersonalizar?.addEventListener(
    "click",
    evento => {
        evento.stopPropagation();

        ventanaPersonalizar?.classList.toggle(
            "visible"
        );
    }
);

cerrarPersonalizar?.addEventListener(
    "click",
    () => {
        ventanaPersonalizar?.classList.remove(
            "visible"
        );
    }
);

temaClaro?.addEventListener(
    "click",
    () => {
        Estado.guardarTema(
            "claro"
        );

        document.body.classList.remove(
            "tema-oscuro"
        );
    }
);

temaOscuro?.addEventListener(
    "click",
    () => {
        Estado.guardarTema(
            "oscuro"
        );

        document.body.classList.add(
            "tema-oscuro"
        );
    }
);