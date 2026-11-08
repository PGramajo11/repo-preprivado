
// Obtener el formulario HTML.
const formulario = document.getElementById("formulario");

// FUNCIÓN 1: Cargar las inscripciones (GET).
async function cargarInscripciones() {

    try {
        // Solicitar las inscripciones al servidor.
        const respuesta = await fetch("/api/inscripciones");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las inscripciones.");
        }

        const inscripciones = await respuesta.json();

        // Obtener y limpiar la lista HTML.
        const lista = document.getElementById("lista-inscripciones");
        lista.textContent = "";

        // Mostrar cada registro recibido.
        inscripciones.forEach(function(inscripcion) {

            const elemento = document.createElement("li");

            elemento.textContent =
                `Nombre: ${inscripcion.nombre} | ` +
                `Correo: ${inscripcion.correo} | ` +
                `Teléfono: ${inscripcion.telefono} | ` +
                `Taller: ${inscripcion.taller} | ` +
                `Horario: ${inscripcion.horario}`;

            lista.appendChild(elemento);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}


// FUNCIÓN 2: Registrar inscripciones (POST).
formulario.addEventListener("submit", async (evento) => {

    // TODO 1: Evita que el formulario recargue la página.
    evento.preventDefault();

    // TODO 2: Obtén los valores del formulario.
    const datos = new FormData(formulario);

    console.log(datos.get("nombre"));

    // TODO 3: Envía los cinco datos como JSON con POST.
    try {

        const respuesta = await fetch("/api/inscripciones", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(Object.fromEntries(datos.entries()))
        });

        const resultado = await respuesta.json();

        // TODO 4: Muestra confirmación o error del servidor.
        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "Error al guardar.");
        }

        alert(resultado.mensaje);

        // TODO 5: Limpia el formulario y vuelve a cargar la lista.
        formulario.reset();

        await cargarInscripciones();

    } catch (error) {
        alert("Error: " + error.message);
        console.error(error);
    }

});


// Cargar las inscripciones al abrir la página.
cargarInscripciones();
