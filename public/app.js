
const formulario = document.getElementById("formulario-registro");
const lista = document.getElementById("lista-inscripciones");
const mensaje = document.getElementById("mensaje");
const botonGuardar = document.getElementById("boton-guardar");
const botonCancelar = document.getElementById("boton-cancelar");

let idEnEdicion = null;
let inscripcionesActuales = [];

// Mostrar mensajes al usuario.
function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("error", esError);
}

// Obtener los datos del formulario.
function obtenerDatosFormulario() {
    const datos = new FormData(formulario);
    return Object.fromEntries(datos.entries());
}

// Crear un elemento con texto de forma segura.
function crearElemento(etiqueta, texto, clase = "") {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;

    if (clase) {
        elemento.className = clase;
    }

    return elemento;
}

// Consultar todas las inscripciones.
async function cargarInscripciones() {
    try {
        const respuesta = await fetch("/api/inscripciones");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las inscripciones.");
        }

        inscripcionesActuales = await respuesta.json();
        mostrarInscripciones(inscripcionesActuales);
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, true);
    }
}

// Mostrar las inscripciones en pantalla.
function mostrarInscripciones(inscripciones) {
    lista.textContent = "";

    if (inscripciones.length === 0) {
        lista.appendChild(
            crearElemento("li", "Aún no hay inscripciones.", "vacio")
        );
        return;
    }

    inscripciones.forEach((inscripcion) => {
        const elemento = document.createElement("li");
        elemento.className = "tarjeta-inscripcion";

        const informacion = document.createElement("div");
        informacion.className = "datos-inscripcion";

        const campos = [
            ["Nombre", inscripcion.nombre],
            ["Correo", inscripcion.correo],
            ["Teléfono", inscripcion.telefono],
            ["Taller", inscripcion.taller],
            ["Horario", inscripcion.horario],
            ["Modalidad", inscripcion.modalidad],
            ["Nivel", inscripcion.nivel_experiencia],
            ["Fecha de registro", inscripcion.fecha_registro]
        ];

        campos.forEach(([etiqueta, valor]) => {
            const parrafo = document.createElement("p");
            const titulo = document.createElement("strong");

            titulo.textContent = `${etiqueta}: `;
            parrafo.appendChild(titulo);
            parrafo.appendChild(document.createTextNode(valor ?? ""));

            informacion.appendChild(parrafo);
        });

        const acciones = document.createElement("div");
        acciones.className = "acciones-inscripcion";

        const botonEditar = crearElemento("button", "Editar", "boton-editar");
        botonEditar.type = "button";
        botonEditar.addEventListener("click", () => {
            editarInscripcion(inscripcion.id);
        });

        const botonEliminar = crearElemento(
            "button",
            "Eliminar",
            "boton-eliminar"
        );
        botonEliminar.type = "button";
        botonEliminar.addEventListener("click", () => {
            eliminarInscripcion(inscripcion.id);
        });

        acciones.appendChild(botonEditar);
        acciones.appendChild(botonEliminar);

        elemento.appendChild(informacion);
        elemento.appendChild(acciones);
        lista.appendChild(elemento);
    });
}

// Registrar o actualizar una inscripción.
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formulario.reportValidity()) {
        return;
    }

    const datos = obtenerDatosFormulario();
    const editando = idEnEdicion !== null;

    const url = editando
        ? `/api/inscripciones/${idEnEdicion}`
        : "/api/inscripciones";

    const metodo = editando ? "PUT" : "POST";

    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "No se pudo guardar.");
        }

        cancelarEdicion();
        await actualizarPantalla();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, true);
    } finally {
        botonGuardar.disabled = false;
    }
});

// Cargar los datos de una inscripción para editarla.
function editarInscripcion(id) {
    const inscripcion = inscripcionesActuales.find(
        (registro) => registro.id === id
    );

    if (!inscripcion) {
        mostrarMensaje("No se encontró la inscripción.", true);
        return;
    }

    const campos = [
        "nombre",
        "correo",
        "telefono",
        "taller",
        "horario",
        "modalidad",
        "nivel_experiencia"
    ];

    campos.forEach((campo) => {
        formulario.elements[campo].value = inscripcion[campo];
    });

    idEnEdicion = id;
    botonGuardar.textContent = "Guardar cambios";
    botonCancelar.hidden = false;

    mostrarMensaje("Estás editando una inscripción.");
    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Cancelar la edición y limpiar el formulario.
function cancelarEdicion() {
    idEnEdicion = null;
    formulario.reset();

    botonGuardar.textContent = "Registrar inscripción";
    botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", () => {
    cancelarEdicion();
    mostrarMensaje("Edición cancelada.");
});

// Eliminar una inscripción.
async function eliminarInscripcion(id) {
    const confirmar = window.confirm(
        "¿Estás seguro de que deseas eliminar esta inscripción?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/inscripciones/${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "No se pudo eliminar.");
        }

        if (idEnEdicion === id) {
            cancelarEdicion();
        }

        await actualizarPantalla();
        mostrarMensaje(resultado.mensaje);
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, true);
    }
}

// Consultar los reportes.
async function cargarReportes() {
    try {
        const respuesta = await fetch("/api/reportes/resumen");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los reportes.");
        }

        const reportes = await respuesta.json();

        document.getElementById("total-inscripciones").textContent =
            reportes.total;

        mostrarReporte("reporte-talleres", reportes.porTaller, "taller");
        mostrarReporte("reporte-horarios", reportes.porHorario, "horario");
        mostrarReporte(
            "reporte-modalidades",
            reportes.porModalidad,
            "modalidad"
        );
    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, true);
    }
}

// Mostrar un reporte mediante barras.
function mostrarReporte(idContenedor, datos, campo) {
    const contenedor = document.getElementById(idContenedor);
    contenedor.textContent = "";

    if (datos.length === 0) {
        contenedor.appendChild(
            crearElemento("p", "No hay datos disponibles.", "vacio")
        );
        return;
    }

    const maximo = Math.max(...datos.map((dato) => dato.cantidad));

    datos.forEach((dato) => {
        const fila = document.createElement("div");
        fila.className = "fila-reporte";

        const encabezado = document.createElement("div");
        encabezado.className = "encabezado-reporte";

        encabezado.appendChild(crearElemento("span", dato[campo]));
        encabezado.appendChild(
            crearElemento("strong", String(dato.cantidad))
        );

        const barraFondo = document.createElement("div");
        barraFondo.className = "barra-fondo";

        const barra = document.createElement("div");
        barra.className = "barra-progreso";
        barra.style.width = `${(dato.cantidad / maximo) * 100}%`;

        barraFondo.appendChild(barra);
        fila.appendChild(encabezado);
        fila.appendChild(barraFondo);
        contenedor.appendChild(fila);
    });
}

// Actualizar la lista y los reportes.
async function actualizarPantalla() {
    await cargarInscripciones();
    await cargarReportes();
}

// Cargar los datos al abrir la página.
actualizarPantalla();

