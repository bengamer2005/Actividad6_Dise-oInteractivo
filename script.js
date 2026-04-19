// Utilidades
function esEmailValido(val) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val.trim());
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

function limpiarError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('visible');
}

function marcarCampo(input, esError) {
    input.classList.toggle('campo-error', esError);
    input.classList.toggle('campo-ok', !esError);
}


// Menú hamburguesa
const btnHamburguesa = document.getElementById('btnHamburguesa');
const menuMobile     = document.getElementById('menu-mobile');
const icoHamburguesa = document.getElementById('ico-hamburguesa');
const icoCerrar      = document.getElementById('ico-cerrar');

btnHamburguesa.addEventListener('click', () => {
    const abierto = !menuMobile.classList.contains('hidden');

    if (abierto) {
        // Cerrar
        menuMobile.classList.add('hidden');
        menuMobile.classList.remove('flex');
        icoHamburguesa.classList.remove('hidden');
        icoCerrar.classList.add('hidden');
        btnHamburguesa.setAttribute('aria-expanded', 'false');
    } else {
        // Abrir
        menuMobile.classList.remove('hidden');
        menuMobile.classList.add('flex');
        icoHamburguesa.classList.add('hidden');
        icoCerrar.classList.remove('hidden');
        btnHamburguesa.setAttribute('aria-expanded', 'true');
    }
});

// Cerrar menú mobile al hacer clic en un enlace
menuMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        menuMobile.classList.add('hidden');
        menuMobile.classList.remove('flex');
        icoHamburguesa.classList.remove('hidden');
        icoCerrar.classList.add('hidden');
        btnHamburguesa.setAttribute('aria-expanded', 'false');
    });
});

// Cerrar menú mobile al hacer resize a pantalla grande
window.addEventListener('resize', () => {
    if (window.innerWidth >= 640) {
        menuMobile.classList.add('hidden');
        menuMobile.classList.remove('flex');
        icoHamburguesa.classList.remove('hidden');
        icoCerrar.classList.add('hidden');
        btnHamburguesa.setAttribute('aria-expanded', 'false');
    }
});


// Focus-highlight de estructuras (Actividad 12 — Punto 2)
const badge       = document.getElementById('foco-badge');
const badgeNombre = document.getElementById('foco-nombre');
const btnCerrar   = document.getElementById('btnCerrarFoco');
let estructuraActiva = null;

document.querySelectorAll('.btn-foco').forEach(btn => {
    btn.addEventListener('click', () => {
        const idEstructura = btn.dataset.estructura;
        const nombre       = btn.dataset.nombre;

        // Si ya estaba activa la misma, la desactiva
        if (estructuraActiva === idEstructura) {
            desactivarFoco();
            return;
        }

        activarFoco(idEstructura, nombre);

        // Actualizar aria-pressed en todos los botones
        document.querySelectorAll('.btn-foco').forEach(b => {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            b.classList.toggle('ring-2', b === btn);
            b.classList.toggle('ring-[#85c1e9]', b === btn);
        });
    });
});

function activarFoco(idEstructura, nombre) {
    // Quitar foco anterior si lo había
    if (estructuraActiva) {
        document.getElementById(estructuraActiva)?.classList.remove('estructura-foco-activa');
    }

    estructuraActiva = idEstructura;

    // Agregar clase de foco al elemento seleccionado
    const el = document.getElementById(idEstructura);
    if (el) el.classList.add('estructura-foco-activa');

    // Activar modo foco en body (overlay oscuro)
    document.body.classList.add('modo-foco');

    // Mostrar badge
    badgeNombre.textContent = nombre;
    badge.classList.add('visible');

    // Scroll suave al elemento
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function desactivarFoco() {
    if (estructuraActiva) {
        document.getElementById(estructuraActiva)?.classList.remove('estructura-foco-activa');
    }
    estructuraActiva = null;
    document.body.classList.remove('modo-foco');
    badge.classList.remove('visible');

    // Reset aria-pressed
    document.querySelectorAll('.btn-foco').forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('ring-2', 'ring-[#85c1e9]');
    });
}

btnCerrar.addEventListener('click', desactivarFoco);

// Cerrar foco con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && estructuraActiva) desactivarFoco();
});

// El CSS del modo foco usa .estructura-foco para los elementos que tienen overlay,
// y .estructura-foco-activa para el que está en primer plano.
// Necesitamos inyectar ese estilo dinámicamente ya que Tailwind no puede generarlo.
(function inyectarEstiloFoco() {
    const style = document.createElement('style');
    style.textContent = `
        body.modo-foco .estructura-foco-activa {
            position: relative;
            z-index: 201;
            box-shadow: 0 0 0 4px #85c1e9, 0 8px 32px rgba(0,0,0,0.4);
        }
    `;
    document.head.appendChild(style);
})();

// Lista dinámica de correos
const listaCorreos = [];
const ulLista      = document.getElementById('listaCorreos');
const inputNuevo   = document.getElementById('nuevoCorreo');
const btnAgregar   = document.getElementById('btnAgregar');
const listaVacia   = document.getElementById('lista-vacia');
const listaError   = document.getElementById('lista-error');

function actualizarVista() {
    listaVacia.style.display = listaCorreos.length === 0 ? 'block' : 'none';
}

function crearItemDOM(correo, index) {
    const li = document.createElement('li');
    li.className = 'item-correo flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 shadow-sm hover:shadow-md transition-shadow';
    li.dataset.index = index;

    const span = document.createElement('span');
    span.textContent = correo;
    span.className = 'flex-1 text-sm break-all';

    const btnUsar     = crearBtn('Usar',     'bg-[#2980b9] hover:bg-[#2471a3]', () => usarCorreo(correo));
    const btnEditar   = crearBtn('Editar',   'bg-[#f39c12] hover:bg-[#d68910]', () => activarEdicion(li, index, span, btnEditar, btnUsar));
    const btnEliminar = crearBtn('Eliminar', 'bg-[#c0392b] hover:bg-[#a93226]', () => eliminarItem(li, index));

    li.append(span, btnUsar, btnEditar, btnEliminar);
    return li;
}

function crearBtn(texto, colorClasses, handler) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = texto;
    btn.className = `${colorClasses} text-white text-xs px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-105 whitespace-nowrap`;
    btn.addEventListener('click', handler);
    return btn;
}

function activarEdicion(li, index, span, btnEditar, btnUsar) {
    const input = document.createElement('input');
    input.type = 'email';
    input.className = 'editar-input';
    input.value = listaCorreos[index];
    input.setAttribute('aria-label', 'Editar correo');

    span.replaceWith(input);
    input.focus();

    btnUsar.style.display = 'none';

    const btnGuardar = crearBtn('Guardar', 'bg-[#27ae60] hover:bg-[#1e8449]', () => guardarEdicion(li, index, input, btnUsar));
    btnEditar.replaceWith(btnGuardar);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') guardarEdicion(li, index, input, btnUsar);
    });
}

function guardarEdicion(li, index, input, btnUsar) {
    const valor = input.value.trim();
    if (!esEmailValido(valor)) {
        input.style.borderColor = '#c0392b';
        input.focus();
        return;
    }
    listaCorreos[index] = valor;
    renderizarLista();
    actualizarDropdown();
}

function eliminarItem(li, index) {
    li.classList.add('saliendo');
    li.addEventListener('animationend', () => {
        listaCorreos.splice(index, 1);
        renderizarLista();
        actualizarDropdown();
    }, { once: true });
}

function renderizarLista() {
    ulLista.innerHTML = '';
    listaCorreos.forEach((correo, i) => {
        ulLista.appendChild(crearItemDOM(correo, i));
    });
    actualizarVista();
}

function agregarCorreo() {
    const valor = inputNuevo.value.trim();
    listaError.classList.remove('visible');
    listaError.textContent = '';

    if (!valor) {
        listaError.textContent = 'Ingresa un correo electrónico.';
        listaError.classList.add('visible');
        inputNuevo.focus(); return;
    }
    if (!esEmailValido(valor)) {
        listaError.textContent = 'El correo no tiene un formato válido.';
        listaError.classList.add('visible');
        inputNuevo.focus(); return;
    }
    if (listaCorreos.includes(valor)) {
        listaError.textContent = 'Este correo ya está en la lista.';
        listaError.classList.add('visible');
        inputNuevo.focus(); return;
    }

    listaCorreos.push(valor);
    inputNuevo.value = '';
    renderizarLista();
    actualizarDropdown();
}

btnAgregar.addEventListener('click', agregarCorreo);
inputNuevo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCorreo(); } });
actualizarVista();


// Dropdown "Usar de lista"
const emailInput    = document.getElementById('email');
const btnUsarLista  = document.getElementById('btnUsarLista');
const dropdownLista = document.getElementById('dropdownLista');

function actualizarDropdown() {
    dropdownLista.innerHTML = '';

    if (listaCorreos.length === 0) {
        const p = document.createElement('p');
        p.className = 'px-3 py-2 text-xs text-gray-400 italic';
        p.textContent = 'La lista está vacía. Agrega correos arriba.';
        dropdownLista.appendChild(p);
        return;
    }

    listaCorreos.forEach((correo) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = correo;
        btn.setAttribute('role', 'option');
        btn.className = 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer font-sans';
        btn.addEventListener('click', () => usarCorreo(correo));
        dropdownLista.appendChild(btn);
    });
}

function usarCorreo(correo) {
    emailInput.value = correo;
    cerrarDropdown();
    marcarCampo(emailInput, false);
    limpiarError('email-err');
    emailInput.focus();
}

function abrirDropdown() {
    actualizarDropdown();
    dropdownLista.hidden = false;
    btnUsarLista.setAttribute('aria-expanded', 'true');
}

function cerrarDropdown() {
    dropdownLista.hidden = true;
    btnUsarLista.setAttribute('aria-expanded', 'false');
}

btnUsarLista.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownLista.hidden ? abrirDropdown() : cerrarDropdown();
});

document.addEventListener('click', (e) => {
    if (!dropdownLista.contains(e.target) && e.target !== btnUsarLista) cerrarDropdown();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarDropdown();
        if (estructuraActiva) desactivarFoco();
    }
});


// Validación del formulario
const formulario = document.getElementById('miFormulario');

document.getElementById('nombre').addEventListener('blur',   () => validarNombre());
document.getElementById('email').addEventListener('blur',    () => validarEmail());
document.getElementById('telefono').addEventListener('blur', () => validarTelefono());
document.getElementById('mensaje').addEventListener('blur',  () => validarMensaje());

function validarNombre() {
    const input = document.getElementById('nombre');
    const val = input.value.trim();
    if (!val || val.length < 3) {
        mostrarError('nombre-err', 'El nombre debe tener al menos 3 caracteres.');
        marcarCampo(input, true); return false;
    }
    limpiarError('nombre-err'); marcarCampo(input, false); return true;
}

function validarEmail() {
    const val = emailInput.value.trim();
    if (!val || !esEmailValido(val)) {
        mostrarError('email-err', 'Ingresa un correo electrónico válido.');
        marcarCampo(emailInput, true); return false;
    }
    limpiarError('email-err'); marcarCampo(emailInput, false); return true;
}

function validarTelefono() {
    const input = document.getElementById('telefono');
    const val = input.value.trim();
    if (!val || !/^[0-9]{10}$/.test(val)) {
        mostrarError('tel-err', 'El teléfono debe tener exactamente 10 dígitos.');
        marcarCampo(input, true); return false;
    }
    limpiarError('tel-err'); marcarCampo(input, false); return true;
}

function validarMensaje() {
    const input = document.getElementById('mensaje');
    const val = input.value.trim();
    if (!val || val.length < 10) {
        mostrarError('msg-err', 'El mensaje debe tener al menos 10 caracteres.');
        marcarCampo(input, true); return false;
    }
    limpiarError('msg-err'); marcarCampo(input, false); return true;
}

function validarComo() {
    if (!formulario.querySelector('input[name="como"]:checked')) {
        mostrarError('como-err', 'Selecciona cómo nos encontraste.'); return false;
    }
    limpiarError('como-err'); return true;
}

function validarTerminos() {
    if (!document.getElementById('terminos').checked) {
        mostrarError('terminos-err', 'Debes aceptar los términos y condiciones.'); return false;
    }
    limpiarError('terminos-err'); return true;
}

formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    const ok = [
        validarNombre(), validarEmail(), validarTelefono(),
        validarComo(), validarMensaje(), validarTerminos()
    ].every(Boolean);

    if (!ok) return;

    const comoMap = { redes: 'Redes sociales', amigo: 'Un amigo', busqueda: 'Búsqueda en internet' };
    const comoVal = formulario.querySelector('input[name="como"]:checked').value;

    document.getElementById('resumen-datos').innerHTML = `
        <p><strong>Nombre:</strong> ${document.getElementById('nombre').value.trim()}</p>
        <p><strong>Correo:</strong> ${emailInput.value.trim()}</p>
        <p><strong>Teléfono:</strong> ${document.getElementById('telefono').value.trim()}</p>
        <p><strong>¿Cómo nos encontró?:</strong> ${comoMap[comoVal]}</p>
        <p><strong>Mensaje:</strong> ${document.getElementById('mensaje').value.trim()}</p>
    `;

    formulario.style.display = 'none';
    document.getElementById('resumen-envio').style.display = 'block';
});

document.getElementById('btnNuevoEnvio').addEventListener('click', () => {
    formulario.reset();
    formulario.style.display = 'flex';
    document.getElementById('resumen-envio').style.display = 'none';
    formulario.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('campo-error', 'campo-ok');
    });
    ['nombre-err','email-err','tel-err','como-err','msg-err','terminos-err'].forEach(limpiarError);
});


// IntersectionObserver nav activo

const secciones = document.querySelectorAll('section[id]');
const enlaces   = document.querySelectorAll('nav a');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            enlaces.forEach(a => a.classList.remove('activo'));
            const enlaceActivo = document.querySelector(`nav a[href="#${entry.target.id}"]`);
            if (enlaceActivo) enlaceActivo.classList.add('activo');
        }
    });
}, { threshold: 0.3 });

secciones.forEach(sec => observer.observe(sec));