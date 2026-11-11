
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

// Permitir recibir información en formato JSON.
app.use(express.json());

// Servir los archivos de la carpeta public.
app.use(express.static(path.join(__dirname, "public")));

// Validar y preparar los datos recibidos.
function validarInscripcion(datos) {
    const campos = [
        "nombre",
        "correo",
        "telefono",
        "taller",
        "horario",
        "modalidad",
        "nivel_experiencia"
    ];

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        return { error: "Los datos enviados no son válidos." };
    }

    const inscripcion = {};

    for (const campo of campos) {
        if (typeof datos[campo] !== "string" || datos[campo].trim() === "") {
            return { error: `El campo ${campo} es obligatorio.` };
        }

        inscripcion[campo] = datos[campo].trim();
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(inscripcion.correo)) {
        return { error: "El correo electrónico no tiene un formato válido." };
    }

    const formatoTelefono = /^\+?[0-9\s()-]{7,20}$/;

    if (!formatoTelefono.test(inscripcion.telefono)) {
        return { error: "El teléfono no tiene un formato válido." };
    }

    return { inscripcion };
}

// Validar que el identificador sea un entero positivo.
function obtenerId(valor) {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// GET: consultar todas las inscripciones.
app.get("/api/inscripciones", (req, res) => {
    try {
        const inscripciones = db.prepare(`
            SELECT *
            FROM inscripciones
            ORDER BY id DESC
        `).all();

        return res.json(inscripciones);
    } catch (error) {
        console.error("Error al consultar inscripciones:", error);
        return res.status(500).json({
            mensaje: "No fue posible consultar las inscripciones."
        });
    }
});

// POST: registrar una nueva inscripción.
app.post("/api/inscripciones", (req, res) => {
    const resultado = validarInscripcion(req.body);

    if (resultado.error) {
        return res.status(400).json({
            mensaje: resultado.error
        });
    }

    try {
        const datos = resultado.inscripcion;

        const consulta = db.prepare(`
            INSERT INTO inscripciones (
                nombre,
                correo,
                telefono,
                taller,
                horario,
                modalidad,
                nivel_experiencia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const resultadoDB = consulta.run(
            datos.nombre,
            datos.correo,
            datos.telefono,
            datos.taller,
            datos.horario,
            datos.modalidad,
            datos.nivel_experiencia
        );

        const nuevaInscripcion = db.prepare(`
            SELECT *
            FROM inscripciones
            WHERE id = ?
        `).get(Number(resultadoDB.lastInsertRowid));

        return res.status(201).json({
            mensaje: "Inscripción registrada correctamente.",
            inscripcion: nuevaInscripcion
        });
    } catch (error) {
        console.error("Error al registrar inscripción:", error);
        return res.status(500).json({
            mensaje: "No fue posible registrar la inscripción."
        });
    }
});

// PUT: actualizar una inscripción existente.
app.put("/api/inscripciones/:id", (req, res) => {
    const id = obtenerId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            mensaje: "El identificador de la inscripción no es válido."
        });
    }

    const resultado = validarInscripcion(req.body);

    if (resultado.error) {
        return res.status(400).json({
            mensaje: resultado.error
        });
    }

    try {
        const datos = resultado.inscripcion;

        const consulta = db.prepare(`
            UPDATE inscripciones
            SET
                nombre = ?,
                correo = ?,
                telefono = ?,
                taller = ?,
                horario = ?,
                modalidad = ?,
                nivel_experiencia = ?
            WHERE id = ?
        `);

        const resultadoDB = consulta.run(
            datos.nombre,
            datos.correo,
            datos.telefono,
            datos.taller,
            datos.horario,
            datos.modalidad,
            datos.nivel_experiencia,
            id
        );

        if (resultadoDB.changes === 0) {
            return res.status(404).json({
                mensaje: "No se encontró la inscripción que deseas actualizar."
            });
        }

        const inscripcionActualizada = db.prepare(`
            SELECT *
            FROM inscripciones
            WHERE id = ?
        `).get(id);

        return res.json({
            mensaje: "Inscripción actualizada correctamente.",
            inscripcion: inscripcionActualizada
        });
    } catch (error) {
        console.error("Error al actualizar inscripción:", error);
        return res.status(500).json({
            mensaje: "No fue posible actualizar la inscripción."
        });
    }
});

// DELETE: eliminar una inscripción.
app.delete("/api/inscripciones/:id", (req, res) => {
    const id = obtenerId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            mensaje: "El identificador de la inscripción no es válido."
        });
    }

    try {
        const resultado = db.prepare(`
            DELETE FROM inscripciones
            WHERE id = ?
        `).run(id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                mensaje: "No se encontró la inscripción que deseas eliminar."
            });
        }

        return res.json({
            mensaje: "Inscripción eliminada correctamente."
        });
    } catch (error) {
        console.error("Error al eliminar inscripción:", error);
        return res.status(500).json({
            mensaje: "No fue posible eliminar la inscripción."
        });
    }
});

// GET: obtener el resumen estadístico de las inscripciones.
app.get("/api/reportes/resumen", (req, res) => {
    try {
        const total = db.prepare(`
            SELECT COUNT(*) AS total
            FROM inscripciones
        `).get();

        const porTaller = db.prepare(`
            SELECT taller, COUNT(*) AS cantidad
            FROM inscripciones
            GROUP BY taller
            ORDER BY cantidad DESC
        `).all();

        const porHorario = db.prepare(`
            SELECT horario, COUNT(*) AS cantidad
            FROM inscripciones
            GROUP BY horario
            ORDER BY cantidad DESC
        `).all();

        const porModalidad = db.prepare(`
            SELECT modalidad, COUNT(*) AS cantidad
            FROM inscripciones
            GROUP BY modalidad
            ORDER BY cantidad DESC
        `).all();

        return res.json({
            total: total.total,
            porTaller,
            porHorario,
            porModalidad
        });
    } catch (error) {
        console.error("Error al generar reportes:", error);
        return res.status(500).json({
            mensaje: "No fue posible generar los reportes."
        });
    }
});

// Manejar solicitudes con JSON mal formado.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            mensaje: "El contenido JSON enviado no es válido."
        });
    }

    return next(error);
});

// Iniciar el servidor.
app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
});
