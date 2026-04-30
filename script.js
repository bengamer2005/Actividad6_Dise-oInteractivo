// ════════════════════════════════════════════════════════════════
//  script.js — Actividades 13 y 14
// ════════════════════════════════════════════════════════════════


// ── Menú hamburguesa ──────────────────────────────────────────
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


// ── IntersectionObserver nav activo ─────────────────────────
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


// ════════════════════════════════════════════════════════════════
//  ACTIVIDAD 13 — Audio y Video
// ════════════════════════════════════════════════════════════════

// ── Punto 1: Generación de audio con Web Audio API ────────────
//   Crea una melodía simple (escala de Do mayor) y la codifica
//   como WAV para cargarla en el elemento <audio>.

const btnGenerarSonido = document.getElementById('btnGenerarSonido');
const reproductorAudio = document.getElementById('reproductorAudio');
const audioStatus      = document.getElementById('audio-status');

btnGenerarSonido.addEventListener('click', generarYCargarAudio);

function generarYCargarAudio() {
    btnGenerarSonido.disabled = true;
    audioStatus.textContent   = 'Generando…';

    // Frecuencias de la escala de Do mayor (C4–C5)
    const notas = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

    const sampleRate  = 44100;
    const duraNota    = 0.35;   // segundos por nota
    const totalSamples = Math.ceil(sampleRate * duraNota * notas.length);

    // AudioContext offline para renderizar sin reproducir directamente
    const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);

    notas.forEach((frecuencia, i) => {
        const inicio = i * duraNota;

        // Oscilador principal (onda sinusoidal)
        const osc = offlineCtx.createOscillator();
        osc.type      = 'sine';
        osc.frequency.setValueAtTime(frecuencia, inicio);

        // Envelope: ataque y caída para evitar clics
        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(0, inicio);
        gain.gain.linearRampToValueAtTime(0.6, inicio + 0.02);
        gain.gain.linearRampToValueAtTime(0,   inicio + duraNota - 0.02);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(inicio);
        osc.stop(inicio + duraNota);
    });

    offlineCtx.startRendering().then(buffer => {
        const wavBlob = audioBufferToWav(buffer);
        const url     = URL.createObjectURL(wavBlob);
        reproductorAudio.src = url;
        reproductorAudio.load();
        audioStatus.textContent   = 'Listo. Presiona Start para reproducir.';
        btnGenerarSonido.disabled = false;
    }).catch(err => {
        audioStatus.textContent   = 'Error al generar audio.';
        btnGenerarSonido.disabled = false;
        console.error(err);
    });
}

// Codifica un AudioBuffer como archivo WAV (PCM 16-bit, mono)
function audioBufferToWav(buffer) {
    const numSamples  = buffer.length;
    const sampleRate  = buffer.sampleRate;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate    = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign  = numChannels * (bitsPerSample / 8);
    const dataSize    = numSamples * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view        = new DataView(arrayBuffer);

    // Helper: escribir cadena ASCII
    const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    // Cabecera RIFF
    writeStr(0,  'RIFF');
    view.setUint32(4,  36 + dataSize, true);
    writeStr(8,  'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);           // tamaño del bloque fmt
    view.setUint16(20, 1,  true);           // formato PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate,   true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    // Muestras PCM 16-bit
    const channel = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < numSamples; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}


// ── Punto 2: Generación de video con Canvas + MediaRecorder ──
//   Anima partículas en un canvas oculto, graba el stream 3 s,
//   y carga el Blob resultante en el elemento <video>.

const btnGenerarVideo   = document.getElementById('btnGenerarVideo');
const canvasVideo       = document.getElementById('canvasVideo');
const reproductorVideo  = document.getElementById('reproductorVideo');
const videoProgressWrap = document.getElementById('video-progress-wrap');
const videoProgressBar  = document.getElementById('video-progress-bar');
const videoStatus       = document.getElementById('video-status');

btnGenerarVideo.addEventListener('click', generarVideo);

function generarVideo() {
    btnGenerarVideo.disabled = true;
    videoProgressWrap.classList.remove('hidden');
    videoProgressWrap.classList.add('flex');
    videoStatus.textContent = 'Grabando…';
    videoProgressBar.style.width = '0%';

    const ctx     = canvasVideo.getContext('2d');
    const W       = canvasVideo.width;
    const H       = canvasVideo.height;
    const DURACION = 3000; // ms
    const FPS      = 30;

    // Crear partículas
    const particulas = Array.from({ length: 60 }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        r:  4 + Math.random() * 8,
        color: `hsl(${Math.random() * 360},70%,60%)`
    }));

    // Capturar stream desde el canvas
    const stream = canvasVideo.captureStream(FPS);

    // Detectar el mimeType soportado por el navegador actual
    const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
        '',   // vacío = el navegador elige automáticamente
    ];
    const mimeType = mimeTypes.find(m => m === '' || MediaRecorder.isTypeSupported(m)) ?? '';

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    const chunks   = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        reproductorVideo.src = url;
        reproductorVideo.load();

        // Detener animación
        cancelAnimationFrame(animFrame);
        videoProgressBar.style.width  = '100%';
        videoStatus.textContent       = 'Listo. Presiona Start para reproducir.';
        btnGenerarVideo.disabled      = false;

        setTimeout(() => {
            videoProgressWrap.classList.add('hidden');
            videoProgressWrap.classList.remove('flex');
        }, 2000);
    };

    recorder.start();

    // Animación
    let animFrame;
    const inicio = performance.now();

    function dibujar(now) {
        const elapsed = now - inicio;
        const progreso = Math.min(elapsed / DURACION, 1);

        // Fondo degradado oscuro
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1a252f');
        grad.addColorStop(1, '#2c3e50');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Actualizar y dibujar partículas
        particulas.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = 10;
            ctx.fill();
            ctx.shadowBlur  = 0;
        });

        // Texto informativo
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font      = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Animación de partículas', W / 2, H - 20);

        // Barra de progreso del video (dentro del canvas)
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(20, H - 12, W - 40, 6);
        ctx.fillStyle = '#85c1e9';
        ctx.fillRect(20, H - 12, (W - 40) * progreso, 6);

        // Actualizar barra HTML
        videoProgressBar.style.width = (progreso * 100) + '%';

        if (elapsed < DURACION) {
            animFrame = requestAnimationFrame(dibujar);
        } else {
            recorder.stop();
        }
    }

    animFrame = requestAnimationFrame(dibujar);
}


// ════════════════════════════════════════════════════════════════
//  ACTIVIDAD 14 — Gráficos 2D con Canvas y SVG
// ════════════════════════════════════════════════════════════════

// ── Punto 1: Dos cuadrados verde y rojo (Canvas) ─────────────
(function dibujarCuadrados() {
    const canvas = document.getElementById('canvas-cuadrados');
    const ctx    = canvas.getContext('2d');

    // Cuadrado verde
    ctx.fillStyle   = '#27ae60';
    ctx.fillRect(20, 25, 100, 100);

    // Cuadrado rojo con borde destacado
    ctx.fillStyle   = '#c0392b';
    ctx.fillRect(160, 25, 100, 100);
    ctx.strokeStyle = '#922b21';
    ctx.lineWidth   = 3;
    ctx.strokeRect(160, 25, 100, 100);

    // Etiquetas
    ctx.fillStyle  = 'white';
    ctx.font       = 'bold 13px sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText('Verde', 70, 82);
    ctx.fillText('Rojo',  210, 82);
})();


// ── Punto 3: Árbol con tronco café y hojas verdes (Canvas) ───
(function dibujarArbol() {
    const canvas = document.getElementById('canvas-arbol');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Tronco (rectángulo café)
    ctx.fillStyle = '#7d4e19';
    ctx.fillRect(W / 2 - 18, H - 90, 36, 85);

    // Sombra suave del tronco
    ctx.fillStyle = '#5d3a10';
    ctx.fillRect(W / 2 + 4, H - 90, 8, 85);

    // Hojas: tres capas de triángulos verdes (de mayor a menor)
    const capas = [
        { y: H - 100, base: 160, alto: 80,  color: '#27ae60' },
        { y: H - 160, base: 130, alto: 75,  color: '#2ecc71' },
        { y: H - 210, base: 100, alto: 70,  color: '#58d68d' },
    ];

    capas.forEach(({ y, base, alto, color }) => {
        ctx.beginPath();
        ctx.moveTo(W / 2 - base / 2, y);         // base izquierda
        ctx.lineTo(W / 2 + base / 2, y);         // base derecha
        ctx.lineTo(W / 2,            y - alto);   // punta
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Contorno suave
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth   = 1;
        ctx.stroke();
    });

    // Punta superior extra para dar volumen
    ctx.beginPath();
    ctx.moveTo(W / 2 - 40, H - 215);
    ctx.lineTo(W / 2 + 40, H - 215);
    ctx.lineTo(W / 2,      H - 275);
    ctx.closePath();
    ctx.fillStyle = '#82e0aa';
    ctx.fill();
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth   = 1;
    ctx.stroke();
})();


// ── Punto 4: Gráfica de negocios de líneas (Canvas) ──────────
(function dibujarGrafica() {
    const canvas  = document.getElementById('canvas-grafica');
    const ctx     = canvas.getContext('2d');
    const tooltip = document.getElementById('grafica-tooltip');

    const W = canvas.width;
    const H = canvas.height;

    // Márgenes
    const margenIzq = 60, margenDer = 20, margenTop = 30, margenBot = 55;
    const areaW = W - margenIzq - margenDer;
    const areaH = H - margenTop - margenBot;

    // Datos de dos series
    const trimestres = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023',
                         'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
    const series = [
        { nombre: 'Ventas',   color: '#2980b9', datos: [42, 58, 53, 71, 65, 80, 76, 94] },
        { nombre: 'Gastos',   color: '#c0392b', datos: [30, 35, 40, 38, 45, 50, 47, 60] },
    ];

    const maxVal = 110;

    // Helpers de coordenadas
    const xPos = i => margenIzq + (i / (trimestres.length - 1)) * areaW;
    const yPos = v => margenTop + areaH - (v / maxVal) * areaH;

    function dibujar() {
        ctx.clearRect(0, 0, W, H);

        // Fondo claro
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, W, H);

        // ── Cuadrícula horizontal ──
        const pasos = 5;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 4]);
        for (let i = 0; i <= pasos; i++) {
            const val = (maxVal / pasos) * i;
            const y   = yPos(val);
            ctx.beginPath();
            ctx.moveTo(margenIzq, y);
            ctx.lineTo(W - margenDer, y);
            ctx.stroke();

            // Etiquetas eje Y
            ctx.setLineDash([]);
            ctx.fillStyle  = '#555';
            ctx.font       = '11px sans-serif';
            ctx.textAlign  = 'right';
            ctx.fillText(val, margenIzq - 8, y + 4);
            ctx.setLineDash([4, 4]);
        }
        ctx.setLineDash([]);

        // ── Ejes ──
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(margenIzq, margenTop);
        ctx.lineTo(margenIzq, margenTop + areaH);
        ctx.lineTo(W - margenDer, margenTop + areaH);
        ctx.stroke();

        // ── Etiquetas eje X ──
        ctx.fillStyle = '#555';
        ctx.font      = '10px sans-serif';
        ctx.textAlign = 'center';
        trimestres.forEach((t, i) => {
            ctx.fillText(t, xPos(i), margenTop + areaH + 18);
        });

        // ── Título eje Y ──
        ctx.save();
        ctx.translate(14, margenTop + areaH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle  = '#2c3e50';
        ctx.font       = 'bold 11px sans-serif';
        ctx.textAlign  = 'center';
        ctx.fillText('Miles de pesos (MXN)', 0, 0);
        ctx.restore();

        // ── Dibujar series ──
        series.forEach(serie => {
            // Área bajo la curva (semitransparente)
            ctx.beginPath();
            ctx.moveTo(xPos(0), yPos(0));
            serie.datos.forEach((v, i) => ctx.lineTo(xPos(i), yPos(v)));
            ctx.lineTo(xPos(serie.datos.length - 1), margenTop + areaH);
            ctx.lineTo(margenIzq, margenTop + areaH);
            ctx.closePath();
            ctx.fillStyle = serie.color + '22'; // muy transparente
            ctx.fill();

            // Línea principal
            ctx.beginPath();
            ctx.strokeStyle = serie.color;
            ctx.lineWidth   = 2.5;
            ctx.lineJoin    = 'round';
            serie.datos.forEach((v, i) => {
                i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v));
            });
            ctx.stroke();

            // Puntos
            serie.datos.forEach((v, i) => {
                ctx.beginPath();
                ctx.arc(xPos(i), yPos(v), 5, 0, Math.PI * 2);
                ctx.fillStyle   = 'white';
                ctx.strokeStyle = serie.color;
                ctx.lineWidth   = 2;
                ctx.fill();
                ctx.stroke();
            });
        });

        // ── Leyenda ──
        const leyX = margenIzq + 10;
        let   leyY = margenTop + 10;
        series.forEach(serie => {
            ctx.fillStyle = serie.color;
            ctx.fillRect(leyX, leyY, 18, 3);
            ctx.beginPath();
            ctx.arc(leyX + 9, leyY + 1.5, 4, 0, Math.PI * 2);
            ctx.fillStyle   = 'white';
            ctx.strokeStyle = serie.color;
            ctx.lineWidth   = 1.5;
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle  = '#2c3e50';
            ctx.font       = '11px sans-serif';
            ctx.textAlign  = 'left';
            ctx.fillText(serie.nombre, leyX + 24, leyY + 5);
            leyY += 20;
        });
    }

    dibujar();

    // ── Tooltip interactivo ───────────────────────────────────
    //   Al acercar el cursor a un punto, muestra nombre y valor.
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx   = (e.clientX - rect.left) * (W / rect.width);
        const my   = (e.clientY - rect.top)  * (H / rect.height);

        let encontrado = false;
        series.forEach(serie => {
            serie.datos.forEach((v, i) => {
                const px = xPos(i), py = yPos(v);
                if (Math.hypot(mx - px, my - py) < 12) {
                    tooltip.style.display = 'block';
                    tooltip.style.left    = (e.clientX - rect.left + 12) + 'px';
                    tooltip.style.top     = (e.clientY - rect.top  - 30) + 'px';
                    tooltip.textContent   = `${serie.nombre} — ${trimestres[i]}: ${v}K`;
                    encontrado = true;
                }
            });
        });

        if (!encontrado) tooltip.style.display = 'none';
    });

    canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
})();