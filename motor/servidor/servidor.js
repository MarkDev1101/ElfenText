/*
node servidor.js

Servidor ElfenText iniciado
http://localhost:3000

Vamos a usar Node.js!!!
*/

const http = require("http");

const servidor = http.createServer((peticion, respuesta) => {

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
        respuesta.writeHead(200, {
            "Content-Type":
                "application/json; charset=utf-8"
        });

        respuesta.end(
            JSON.stringify({
                estado: "ok",
                mensaje:
                    "Solicitud de compilación recibida"
            })
        );

        return;
    }

    respuesta.writeHead(404);
    respuesta.end("Ruta no encontrada.");
});

servidor.listen(3000, () => {
    console.log(
        "Servidor ElfenText iniciado en http://localhost:3000"
    );
});