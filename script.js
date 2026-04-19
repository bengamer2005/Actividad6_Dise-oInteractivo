// Utilidades

function esEmailValido(val) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val.trim())
}

function mostrarError(id, msg) {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = msg
    el.classList.add("visible")
}

function limpiarError(id) {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = ""
    el.classList.remove("visible")
}

function marcarCampo(input, esError) {
    input.classList.toggle("campo-error", esError)
    input.classList.toggle("campo-ok", !esError)
}

// Lista dinámica de correos

const listaCorreos = []          // fuente de verdad
const ulLista = document.getElementById("listaCorreos")
const inputNuevo = document.getElementById("nuevoCorreo")
const btnAgregar = document.getElementById("btnAgregar")
const listaVacia = document.getElementById("lista-vacia")
const listaError = document.getElementById("lista-error")

function actualizarVista() {
    listaVacia.style.display = listaCorreos.length === 0 ? "block" : "none"
}

function crearItemDOM(correo, index) {
    const li = document.createElement("li")
    li.className = "item-correo"
    li.dataset.index = index

    // Modo lectura
    const span = document.createElement("span")
    span.textContent = correo

    const btnUsar = crearBtn("Usar", "btn-accion btn-usar", () => {
        usarCorreo(correo)
    })

    const btnEditar = crearBtn("Editar", "btn-accion btn-editar", () => {
        activarEdicion(li, index, span, btnEditar, btnUsar)
    })

    const btnEliminar = crearBtn("Eliminar", "btn-accion btn-eliminar", () => {
        eliminarItem(li, index)
    })

    li.append(span, btnUsar, btnEditar, btnEliminar)
    return li
}

function crearBtn(texto, clases, handler) {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = texto
    btn.className = clases
    btn.addEventListener("click", handler)
    return btn
}

function activarEdicion(li, index, span, btnEditar, btnUsar) {
    // Reemplazar span por input
    const input = document.createElement("input")
    input.type = "email"
    input.className = "editar-input"
    input.value = listaCorreos[index]
    input.setAttribute("aria-label", "Editar correo")

    span.replaceWith(input)
    input.focus()

    // Cambiar Editar → Guardar, ocultar Usar
    btnUsar.style.display = "none"
    btnEditar.textContent = "Guardar"
    btnEditar.className = "btn-accion btn-guardar"

    // Reemplazar handler de guardar
    const nuevoHandler = () => guardarEdicion(li, index, input, btnEditar, btnUsar)
    btnEditar.replaceWith(btnEditar.cloneNode(false)) // Limpiar listener
    const btnGuardar = li.querySelector(".btn-accion.btn-guardar") || btnEditar

    // Re-crear el botón guardar
    const bg = crearBtn("Guardar", "btn-accion btn-guardar", nuevoHandler)
    input.after(bg)

    // También guardar con Enter
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") nuevoHandler()
    })
}

function guardarEdicion(li, index, input, btnEditar, btnUsar) {
    const valor = input.value.trim()

    if (!esEmailValido(valor)) {
        input.style.borderColor = "#c0392b"
        input.focus()
        return
    }

    listaCorreos[index] = valor
    renderizarLista()
    actualizarDropdown()
}

function eliminarItem(li, index) {
    // Animación de salida con requestAnimationFrame
    li.classList.add("saliendo")

    li.addEventListener("animationend", () => {
        listaCorreos.splice(index, 1)
        renderizarLista()
        actualizarDropdown()
    }, { once: true })
}

function renderizarLista() {
    ulLista.innerHTML = ""
    listaCorreos.forEach((correo, i) => {
        const item = crearItemDOM(correo, i)
        ulLista.appendChild(item)
    })
    actualizarVista()
}

function agregarCorreo() {
    const valor = inputNuevo.value.trim()

    // Validar
    listaError.classList.remove("visible")
    listaError.textContent = ""

    if (!valor) {
        listaError.textContent = "Ingresa un correo electrónico."
        listaError.classList.add("visible")
        inputNuevo.focus()
        return
    }

    if (!esEmailValido(valor)) {
        listaError.textContent = "El correo no tiene un formato válido."
        listaError.classList.add("visible")
        inputNuevo.focus()
        return
    }

    if (listaCorreos.includes(valor)) {
        listaError.textContent = "Este correo ya está en la lista."
        listaError.classList.add("visible")
        inputNuevo.focus()
        return
    }

    listaCorreos.push(valor)
    inputNuevo.value = ""
    renderizarLista()
    actualizarDropdown()
}

// Botón agregar
btnAgregar.addEventListener("click", agregarCorreo)

// También con Enter en el input
inputNuevo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); agregarCorreo() }
})

// Estado inicial
actualizarVista()


// Dropdown "Usar de lista" en formulario

const emailInput     = document.getElementById("email")
const btnUsarLista   = document.getElementById("btnUsarLista")
const dropdownLista  = document.getElementById("dropdownLista")

function actualizarDropdown() {
    dropdownLista.innerHTML = ""

    if (listaCorreos.length === 0) {
        const p = document.createElement("p")
        p.className = "sin-correos"
        p.textContent = "La lista está vacía. Agrega correos arriba."
        dropdownLista.appendChild(p)
        return
    }

    listaCorreos.forEach((correo) => {
        const btn = document.createElement("button")
        btn.type = "button"
        btn.textContent = correo
        btn.setAttribute("role", "option")
        btn.addEventListener("click", () => {
            usarCorreo(correo)
        })
        dropdownLista.appendChild(btn)
    })
}

function usarCorreo(correo) {
    emailInput.value = correo
    cerrarDropdown()
    // Disparar validación visual al usarlo
    marcarCampo(emailInput, false)
    limpiarError("email-err")
    emailInput.focus()
}

function abrirDropdown() {
    actualizarDropdown()
    dropdownLista.hidden = false
    btnUsarLista.setAttribute("aria-expanded", "true")
}

function cerrarDropdown() {
    dropdownLista.hidden = true
    btnUsarLista.setAttribute("aria-expanded", "false")
}

btnUsarLista.addEventListener("click", (e) => {
    e.stopPropagation()
    dropdownLista.hidden ? abrirDropdown() : cerrarDropdown()
})

// Cerrar dropdown al clic fuera
document.addEventListener("click", (e) => {
    if (!dropdownLista.contains(e.target) && e.target !== btnUsarLista) {
        cerrarDropdown()
    }
})

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDropdown()
})


// Validación del formulario

const formulario = document.getElementById("miFormulario")

// Validación en tiempo real (focus out)
document.getElementById("nombre").addEventListener("blur", () => validarNombre())
document.getElementById("email").addEventListener("blur",  () => validarEmail())
document.getElementById("telefono").addEventListener("blur", () => validarTelefono())
document.getElementById("mensaje").addEventListener("blur", () => validarMensaje())

function validarNombre() {
    const val = document.getElementById("nombre").value.trim()
    const input = document.getElementById("nombre")
    if (!val || val.length < 3) {
        mostrarError("nombre-err", "El nombre debe tener al menos 3 caracteres.")
        marcarCampo(input, true)
        return false
    }
    limpiarError("nombre-err")
    marcarCampo(input, false)
    return true
}

function validarEmail() {
    const val = emailInput.value.trim()
    if (!val || !esEmailValido(val)) {
        mostrarError("email-err", "Ingresa un correo electrónico válido.")
        marcarCampo(emailInput, true)
        return false
    }
    limpiarError("email-err")
    marcarCampo(emailInput, false)
    return true
}

function validarTelefono() {
    const val = document.getElementById("telefono").value.trim()
    const input = document.getElementById("telefono")
    if (!val || !/^[0-9]{10}$/.test(val)) {
        mostrarError("tel-err", "El teléfono debe tener exactamente 10 dígitos.")
        marcarCampo(input, true)
        return false
    }
    limpiarError("tel-err")
    marcarCampo(input, false)
    return true
}

function validarMensaje() {
    const val = document.getElementById("mensaje").value.trim()
    const input = document.getElementById("mensaje")
    if (!val || val.length < 10) {
        mostrarError("msg-err", "El mensaje debe tener al menos 10 caracteres.")
        marcarCampo(input, true)
        return false
    }
    limpiarError("msg-err")
    marcarCampo(input, false)
    return true
}

function validarComo() {
    const sel = formulario.querySelector("input[name='como']:checked")
    if (!sel) {
        mostrarError("como-err", "Selecciona cómo nos encontraste.")
        return false
    }
    limpiarError("como-err")
    return true
}

function validarTerminos() {
    const cb = document.getElementById("terminos")
    if (!cb.checked) {
        mostrarError("terminos-err", "Debes aceptar los términos y condiciones.")
        return false
    }
    limpiarError("terminos-err")
    return true
}

formulario.addEventListener("submit", function (e) {
    e.preventDefault()

    const ok = [
        validarNombre(),
        validarEmail(),
        validarTelefono(),
        validarComo(),
        validarMensaje(),
        validarTerminos()
    ].every(Boolean)

    if (!ok) return

    // Mostrar resumen
    const comoMap = { redes: "Redes sociales", amigo: "Un amigo", busqueda: "Búsqueda en internet" }
    const comoVal = formulario.querySelector("input[name='como']:checked").value

    const resumen = document.getElementById("resumen-envio")
    document.getElementById("resumen-datos").innerHTML = `
        <p><strong>Nombre:</strong> ${document.getElementById("nombre").value.trim()}</p>
        <p><strong>Correo:</strong> ${emailInput.value.trim()}</p>
        <p><strong>Teléfono:</strong> ${document.getElementById("telefono").value.trim()}</p>
        <p><strong>¿Cómo nos encontró?:</strong> ${comoMap[comoVal]}</p>
        <p><strong>Mensaje:</strong> ${document.getElementById("mensaje").value.trim()}</p>
    `

    formulario.style.display = "none"
    resumen.style.display = "block"
})

// Botón "Nuevo mensaje"
document.getElementById("btnNuevoEnvio").addEventListener("click", () => {
    formulario.reset()
    formulario.style.display = "flex"
    document.getElementById("resumen-envio").style.display = "none"

    // Limpiar clases de validación
    formulario.querySelectorAll("input, textarea").forEach(el => {
        el.classList.remove("campo-error", "campo-ok")
    })
    ["nombre-err","email-err","tel-err","como-err","msg-err","terminos-err"].forEach(limpiarError)
})


// IntersectionObserver para nav activo
const secciones = document.querySelectorAll("section[id]")
const enlaces   = document.querySelectorAll("nav ul li a")

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            enlaces.forEach(a => a.classList.remove("activo"))
            const enlaceActivo = document.querySelector(`nav ul li a[href="#${entry.target.id}"]`)
            if (enlaceActivo) enlaceActivo.classList.add("activo")
        }
    })
}, { threshold: 0.3 })

secciones.forEach(sec => observer.observe(sec))