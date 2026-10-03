/*
node servidor.js

Servidor ElfenText iniciado
http://localhost:3000

Vamos a usar Node.js!!!
*/

const http = require("http");

const {
    reconstruirProyecto
} = require("../proyecto/gestorProyecto");

const servidor = http.createServer(
    (peticion, respuesta) => {

        respuesta.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

        respuesta.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        );

        respuesta.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );

        if (peticion.method === "OPTIONS") {
            respuesta.writeHead(204);
            respuesta.end();
            return;
        }

        if (
            peticion.method === "GET" &&
            peticion.url === "/"
        ) {
            respuesta.writeHead(200, {
                "Content-Type":
                    "text/plain; charset=utf-8"
            });

            respuesta.end(
                "Motor ElfenText funcionando."
            );

            return;
        }

        if (
            peticion.method === "POST" &&
            peticion.url === "/compile"
        ) {
            let cuerpo = "";

            peticion.on(
                "data",
                fragmento => {
                    cuerpo += fragmento;
                }
            );

            peticion.on(
                "end",
                async () => {
                    try {
                        const proyectoRecibido =
                            JSON.parse(cuerpo);

                        const carpetaProyecto =
                            await reconstruirProyecto(
                                proyectoRecibido
                            );

                        console.log(
                            "Proyecto reconstruido en:"
                        );

                        console.log(
                            carpetaProyecto
                        );

                        respuesta.writeHead(
                            200,
                            {
                                "Content-Type":
                                    "application/json; charset=utf-8"
                            }
                        );

                        respuesta.end(
                            JSON.stringify({
                                estado: "ok",
                                mensaje:
                                    "Proyecto reconstruido correctamente",
                                ruta:
                                    carpetaProyecto
                            })
                        );

                    } catch (error) {
                        console.error(
                            "Error al reconstruir proyecto:",
                            error
                        );

                        respuesta.writeHead(
                            500,
                            {
                                "Content-Type":
                                    "application/json; charset=utf-8"
                            }
                        );

                        respuesta.end(
                            JSON.stringify({
                                estado: "error",
                                mensaje:
                                    "No se pudo reconstruir el proyecto"
                            })
                        );
                    }
                }
            );

            return;
        }

        respuesta.writeHead(404, {
            "Content-Type":
                "text/plain; charset=utf-8"
        });

        respuesta.end(
            "Ruta no encontrada."
        );
    }
);

servidor.listen(3000, () => {
    console.log(
        "Servidor ElfenText iniciado en http://localhost:3000"
    );
});