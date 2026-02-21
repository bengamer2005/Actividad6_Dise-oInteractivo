// ══════════════════════════════════
//  CANVAS — Dibujo interactivo
// ══════════════════════════════════

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


// ══════════════════════════════════
//  FORMULARIO — Validación y envío
// ══════════════════════════════════

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