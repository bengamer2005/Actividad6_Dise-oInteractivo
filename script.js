//  CANVAS — Dibujo interactivo
const canvas = document.getElementById('miCanvas');
const ctx    = canvas.getContext('2d');

// Texto inicial de instrucción
ctx.fillStyle   = '#999';
ctx.font        = '14px Arial';
ctx.textAlign   = 'center';
ctx.fillText('Haz clic aquí para dibujar', canvas.width / 2, canvas.height / 2);

// Colores que se irán rotando con cada clic
const colores = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
let colorIndex = 0;

canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = colores[colorIndex % colores.length];
    ctx.fill();

    colorIndex++;
});


//  FORMULARIO — Validación y envío
const formulario    = document.getElementById('miFormulario');
const mensajeExito  = document.getElementById('mensaje-exito');

formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    // Verificar que se seleccionó un radio button
    const radioSeleccionado = formulario.querySelector('input[name="como"]:checked');
    if (!radioSeleccionado) {
        alert('Por favor selecciona cómo nos encontraste.');
        return;
    }

    // Usar la validación nativa de HTML5 para el resto de campos
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    // Mostrar mensaje de éxito y ocultar el formulario
    formulario.style.display = 'none';
    mensajeExito.style.display = 'block';
});

//  PUNTO 2 — Fondo cambia de color con delay
const bgCycles = ['#eaf4fb', '#eafaf1', '#fef9e7', '#f4f6f8'];
let bgIdx = 0;
const bgDot = document.getElementById('bgDot');

setTimeout(function cycleBg() {
    document.body.style.backgroundColor = bgCycles[bgIdx % bgCycles.length];
    bgDot.style.backgroundColor = bgCycles[bgIdx % bgCycles.length];
    bgDot.textContent = 'Activo';
    bgIdx++;
    setTimeout(cycleBg, 4000);
}, 2000);

//  PUNTO 3 — translateX/Y al clic
const boxMove = document.getElementById('boxMove');
boxMove.addEventListener('click', () => {
    boxMove.classList.toggle('moved');
    boxMove.textContent = boxMove.classList.contains('moved') ? 'VOLVER' : 'CLICK';
});

//  PUNTO 3 — scale() al clic
const boxScale = document.getElementById('boxScale');
boxScale.addEventListener('click', () => {
    boxScale.classList.toggle('scaled');
    boxScale.textContent = boxScale.classList.contains('scaled') ? 'BIG!' : 'TAP';
});

//  PUNTO 4 — Formulario login con animaciones
document.getElementById('btnSubmit').addEventListener('click', function () {
    const btn        = this;
    const emailInput = document.getElementById('loginEmail');
    const passInput  = document.getElementById('loginPass');
    const emailErr   = document.getElementById('loginEmailErr');
    const passErr    = document.getElementById('loginPassErr');

    // Reset estados anteriores
    emailInput.classList.remove('error', 'success');
    passInput.classList.remove('error', 'success');
    emailErr.classList.remove('visible');
    passErr.classList.remove('visible');
    btn.classList.remove('error-state', 'sent', 'sending');

    let hasError = false;
    const emailVal = emailInput.value.trim();
    const passVal  = passInput.value.trim();

    if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        emailInput.classList.add('error');
        emailErr.classList.add('visible');
        hasError = true;
    } else {
        emailInput.classList.add('success');
    }

    if (passVal.length < 6) {
        passInput.classList.add('error');
        passErr.classList.add('visible');
        hasError = true;
    } else {
        passInput.classList.add('success');
    }

    if (hasError) {
        btn.classList.add('error-state');
        btn.textContent = 'Revisa los campos';
        setTimeout(() => {
            btn.classList.remove('error-state');
            btn.textContent = 'Iniciar sesión';
        }, 1800);
        return;
    }

    // Animación de envío exitoso
    btn.classList.add('sending');
    btn.textContent = 'Enviando…';
    setTimeout(() => {
        btn.classList.remove('sending');
        btn.classList.add('sent');
        btn.textContent = 'Sesión iniciada';
    }, 800);
    setTimeout(() => {
        btn.classList.remove('sent');
        btn.textContent = 'Iniciar sesión';
        emailInput.value = '';
        passInput.value  = '';
        emailInput.classList.remove('success');
        passInput.classList.remove('success');
    }, 3000);
});