
const express = require("express");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 3000;

// Este arreglo guarda los registros solo mientras el servidor está activo.
const inscripciones = [];

// Permite recibir datos en formato JSON.
app.use(express.json());

// Permite mostrar los archivos de la carpeta public.
app.use(express.static(path.join(__dirname, "public")));

// GET: Consultar todas las inscripciones.
app.get("/api/inscripciones", (req, res) => {
    res.json(inscripciones);
});

// POST: Registrar una nueva inscripción.
app.post("/api/inscripciones", (req, res) => {

    // TODO 1: Extrae nombre, correo, telefono, taller y horario de req.body.
    const { nombre, correo, telefono, taller, horario } = req.body || {};

    // TODO 2: Revisa que todos los campos existan y no estén vacíos.
    const campos = [nombre, correo, telefono, taller, horario];

    if (
        campos.some(campo =>
            typeof campo !== "string" || campo.trim() === ""
        )
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios."
        });
    }

    // TODO 3: Comprueba que el correo tenga un formato válido.
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correo.trim())) {
        return res.status(400).json({
            mensaje: "El correo electrónico no tiene un formato válido."
        });
    }

    // TODO 4: Crea un objeto con id y los cinco datos; agrégalo a inscripciones.
    const nuevaInscripcion = {
        id: randomUUID(),
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        taller: taller.trim(),
        horario: horario.trim()
    };

    inscripciones.push(nuevaInscripcion);

    // TODO 5: Responde con estado 201 y el registro creado.
    return res.status(201).json({
        mensaje: "Inscripción registrada correctamente.",
        inscripcion: nuevaInscripcion
    });

});

// Iniciar el servidor.
app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
});
