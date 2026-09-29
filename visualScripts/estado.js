const Estado = {

    guardarTema(tema) {
        localStorage.setItem("tema", tema);
    },

    obtenerTema() {
        return localStorage.getItem("tema") || "claro";
    },

    guardarProyecto(nombre) {
        sessionStorage.setItem("proyectoActual", nombre);
    },

    obtenerProyecto() {
        return sessionStorage.getItem("proyectoActual");
    },

    cerrarProyecto() {
        sessionStorage.removeItem("proyectoActual");
    },

    abrirBaseDatos() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("ElfenTextDB", 2);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains("estado")) {
                    db.createObjectStore("estado");
                }

                if (!db.objectStoreNames.contains("proyectos")) {
                    db.createObjectStore("proyectos");
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    async guardarCarpeta(carpeta) {
        const db = await this.abrirBaseDatos();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                "estado",
                "readwrite"
            );

            transaction
                .objectStore("estado")
                .put(carpeta, "carpetaProyectos");

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    },

    async obtenerCarpeta() {
        const db = await this.abrirBaseDatos();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                "estado",
                "readonly"
            );

            const request = transaction
                .objectStore("estado")
                .get("carpetaProyectos");

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    async guardarProyectoHandle(nombre, handle) {
        const db = await this.abrirBaseDatos();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                "proyectos",
                "readwrite"
            );

            transaction
                .objectStore("proyectos")
                .put(handle, nombre);

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    },

    async obtenerProyectoHandle(nombre) {
        const db = await this.abrirBaseDatos();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                "proyectos",
                "readonly"
            );

            const request = transaction
                .objectStore("proyectos")
                .get(nombre);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

};