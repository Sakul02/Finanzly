// ==========================================
// CONFIGURACIÓN DE AUDIO
// ==========================================
const audioMetaCompletada = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
const audioClic = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const audioCrecimiento = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); 
const audioHover = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');

audioMetaCompletada.volume = 0.4;
audioClic.volume = 0.2;
audioCrecimiento.volume = 0.5;
audioHover.volume = 0.3;

// Función para desbloquear el audio en navegadores (Chrome/Safari/Edge)
const desbloquearAudio = () => {
    const audios = [audioMetaCompletada, audioClic, audioCrecimiento, audioHover];
    audios.forEach(audio => {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});
    });
    document.removeEventListener('click', desbloquearAudio);
};
document.addEventListener('click', desbloquearAudio);

// ==========================================
// GESTIÓN DE NOTIFICACIONES TOAST
// ==========================================
// Variable global para rastrear las alertas ya notificadas
let notifiedAlerts = {};

/**
 * Muestra una notificación "toast" en la esquina inferior derecha.
 * @param {string} message El mensaje a mostrar.
 * @param {'info'|'warning'|'error'|'success'} type El tipo de notificación para estilo e icono.
 * @param {string|null} category Opcional. La categoría para evitar notificaciones repetidas.
 * @param {number} duration Duración en milisegundos antes de que el toast desaparezca.
 */
function showToast(message, type = 'info', category = null, duration = 5000) {
    // Si esta alerta específica (categoría + tipo) ya fue mostrada y no ha desaparecido, no la mostramos de nuevo.
    if (category && notifiedAlerts[category] && notifiedAlerts[category][type]) {
        return;
    }

    const toastContainer = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        Object.assign(div.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column-reverse', // Las nuevas notificaciones aparecen encima
            gap: '10px'
        });
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    Object.assign(toast.style, {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-main)',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '300px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
    });

    let icon = '💡'; // Icono por defecto
    let borderColor = 'var(--primary)';

    if (type === 'warning') { icon = '⚠️'; borderColor = '#f59e0b'; }
    else if (type === 'error') { icon = '🚨'; borderColor = 'var(--red)'; }
    else if (type === 'success') { icon = '✅'; borderColor = 'var(--primary)'; }

    toast.style.borderLeft = `5px solid ${borderColor}`;
    toast.innerHTML = `<span style="font-size: 1.2em;">${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Actualizar el estado de notificación para esta categoría y tipo
    if (category) {
        if (!notifiedAlerts[category]) notifiedAlerts[category] = {};
        notifiedAlerts[category][type] = true;
    }

    // Animación de salida y eliminación
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.addEventListener('transitionend', () => {
            toast.remove();
            // Resetear el estado de notificación después de que el toast desaparece
            // Esto permite que el toast reaparezca si la condición se cumple de nuevo
            // después de que la notificación anterior haya terminado.
            if (category && notifiedAlerts[category]) {
                notifiedAlerts[category][type] = false;
            }
        }, { once: true });
    }, duration);
}

// ==========================================
// CONFIGURACIÓN DE COLORES POR CATEGORÍA
// ==========================================
const coloresCategorias = {
    'Alimentos': '#e81999',
    'Comida': '#10b981',
    'Transporte': '#3b82f6',
    'Servicios': '#f59e0b',
    'Luz': '#f59e0b',
    'Agua': '#f59e0b',
    'Internet': '#f59e0b',
    'Salud': '#ef4444',
    'Educación': '#8b5cf6',
    'Estudio': '#8b5cf6',
    'Ocio': '#06b6d4',
    'Alquiler': '#f43f5e',
    'Seguros': '#6366f1',
    'Formación Profesional': '#a855f7',
    'Otros': '#84cc16',
    'Metas': '#3b82f6',
    'Reintegro de Meta': '#28a745' // Nuevo color para reintegros de metas
};

// ==========================================
// 0. GESTIÓN DE MODO OSCURO (PERSISTENTE)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    console.log('Botón clickeado'); // Confirmación en F12
    audioClic.play().catch(() => {}); // Sonido sutil al interactuar
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    actualizarElementosTheme(isDark);
}

/**
 * Gestiona el Tooltip personalizado para los indicadores del calendario del filtro.
 */
function mostrarTooltipPersonalizado(e, html) {
    let tooltip = document.getElementById('custom-calendar-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'custom-calendar-tooltip';
        tooltip.className = 'custom-calendar-tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    
    clearTimeout(timeoutTooltip);

    tooltip.onmouseenter = () => {
        clearTimeout(timeoutTooltip);
    };

    tooltip.onmouseleave = () => {
    tooltip.style.display = 'none';
    };

    const rect = e.target.getBoundingClientRect();
    // Posicionamiento dinámico: centrado horizontalmente sobre el punto y arriba
    tooltip.style.left = `${rect.left - (tooltip.offsetWidth / 2) + 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 12}px`;
}

let timeoutTooltip;

function ocultarTooltipPersonalizado() {
    clearTimeout(timeoutTooltip);

    timeoutTooltip = setTimeout(() => {
        const tooltip = document.getElementById('custom-calendar-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }, 100);
}

function obtenerFechaLocal(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function crearDetalleDia(mapaActividad, dateStr) {
    const act = mapaActividad[dateStr];
    if (!act) return '';

    const items = [
        ...act.ingresos.map(t => ({ ...t, color: coloresCategorias[t.categoria] || '#10b981' })),
        ...act.gastos.map(t => ({ ...t, color: coloresCategorias[t.categoria] || '#ef4444' }))
    ].map(t => `
        <div class="tooltip-item-row">
            <span class="tooltip-item-desc">
                <span style="color:${t.color}; font-size:1rem;">●</span>
                ${t.descripcion}
            </span>
            <span class="tooltip-item-monto">$${parseFloat(t.monto).toLocaleString('es-AR')}</span>
        </div>`).join('');

    return `
        <div style="font-weight:800; font-size:0.65rem; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:4px;">Movimientos del Día</div>
        <div style="max-height: 150px; overflow-y: auto; overflow-x: hidden;">${items}</div>
        <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); font-size:0.75rem;">
            <div style="display:flex; justify-content:space-between; color:var(--green);"><span>Ingresos:</span><strong>$${act.totalIng.toLocaleString('es-AR')}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--red);"><span>Gastos:</span><strong>$${act.totalGas.toLocaleString('es-AR')}</strong></div>
        </div>`;
}

function actualizarElementosTheme(isDark) {
    // Cambiar Icono del botón
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerText = isDark ? '☀️' : '🌙';
    }

    // Cambiar Logo dinámicamente
    const logo = document.getElementById('logo-finanzly');
    if (logo) {
        logo.src = isDark ? 'finanzly_dorado.png' : 'finanzly_verde.png';
    }

    // Configuración Global de Chart.js para Modo Oscuro
    if (window.Chart) {
        const textColor = isDark ? '#ffffff' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        Chart.defaults.color = textColor;
        Chart.defaults.scale.grid.color = gridColor;
        
        // Forzar actualización de gráficos existentes si la función ya está disponible
        if (typeof cargarGraficos === 'function') {
            cargarGraficos();
        }
    }
}

// Ejecutar inmediatamente para aplicar el tema antes de que cargue el resto del DOM
initTheme();

// ==========================================
// 1. VARIABLES, SELECTORES GLOBALES Y UTILIDADES DE FORMATO
// ==========================================
let myChartDonut = null;
let chartSemanal = null;
let chartResumenCategorias = null;
let calendar = null;
let weekOffset = 0;
let idMetaEditando = null; 
let idMetaAbonando = null;
let idMetaEliminando = null;
let idLimiteEliminando = null; // Nueva variable para el ID del límite a eliminar
let idTransaccionEliminando = null; // Nueva variable para el ID de la transacción a eliminar
let lastBalance = 0;
let lastIncome = 0;
let lastExpenses = 0;
let estadosPlantasAnterior = {}; // Rastro para detectar evolución de "Mi Brote"

/**
 * Motor 'Mi Brote': Retorna la ruta del activo según el porcentaje de ahorro.
 */
function obtenerPlantaPorPorcentaje(porcentaje) {
    if (porcentaje >= 100) return './assets/images/arbol_monedas.png';
    if (porcentaje >= 71) return './assets/icons/arbol-fuerte.png';
    if (porcentaje >= 41) return './assets/icons/arbol-simple.svg';
    if (porcentaje >= 21) return './assets/icons/brote.svg';
    return './assets/icons/semilla.svg';
}

/**
 * Actualiza visualmente el estado de la planta en una tarjeta específica.
 */
function actualizarVisualMeta(elementId, porcentaje) {
    const container = document.querySelector(`.goal-card[data-id="${elementId}"] .asistente-msg`);
    if (!container) return;

    const imgSrc = obtenerPlantaPorPorcentaje(porcentaje);
    const existingImg = container.querySelector('.estado-planta');

    if (existingImg) {
        existingImg.src = imgSrc;
    } else {
        // Si por alguna razón no existe (ej: renderizado inicial), la creamos
        const newImg = document.createElement('img');
        newImg.src = imgSrc;
        newImg.className = 'estado-planta robot-icon riego';
        container.prepend(newImg);
    }
}

/**
 * Crea una explosión sutil de destellos dorados alrededor de un contenedor.
 */
function crearDestellos(contenedor) {
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    contenedor.appendChild(sparkleContainer);

    for (let i = 0; i < 12; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        // Dirección aleatoria en un círculo
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        sparkle.style.setProperty('--x', `${x}px`);
        sparkle.style.setProperty('--y', `${y}px`);
        // Variación en la duración y retraso de la animación
        const duration = 0.6 + Math.random() * 0.4;
        sparkle.style.animation = `sparkle-anim ${duration}s ease-out forwards`;

        sparkleContainer.appendChild(sparkle);
    }

    // Limpiar el DOM después de la animación
    setTimeout(() => sparkleContainer.remove(), 1000);
}

/**
 * Simula el efecto de máquina de escribir en un elemento.
 */
function efectoEscritura(elemento, texto, velocidad = 40) {
    elemento.innerHTML = "";
    elemento.classList.add("typing-cursor");
    let i = 0;

    const intervalo = setInterval(() => {
        if (i < texto.length) {
            elemento.innerHTML += texto.charAt(i);
            i++;
        } else {
            clearInterval(intervalo);
            // Quitamos el cursor después de un par de segundos
            setTimeout(() => elemento.classList.remove("typing-cursor"), 2000);
        }
    }, velocidad);
}

/**
 * Anima un valor numérico dentro de un elemento con efecto de conteo y transición CSS.
 */
function animarSaldo(idElemento, valorAnterior, valorNuevo) {
    const el = document.getElementById(idElemento);
    if (!el) return;

    // Reiniciar animación CSS
    el.classList.remove('animate-value');
    void el.offsetWidth; // Forzar reflujo para reiniciar animación
    el.classList.add('animate-value');

    const duracion = 2000; // 2 segundos
    const inicio = performance.now();

    const actualizar = (tiempoActual) => {
        const transcurrido = tiempoActual - inicio;
        const progreso = Math.min(transcurrido / duracion, 1);

        // Easing: easeOutQuart para una desaceleración suave
        const progresoSuave = 1 - Math.pow(1 - progreso, 4);
        
        const valorActual = valorAnterior + (valorNuevo - valorAnterior) * progresoSuave;
        
        // Formatear moneda es-AR
        el.innerText = `$ ${Math.round(valorActual).toLocaleString('es-AR')}`;

        if (progreso < 1) {
            requestAnimationFrame(actualizar);
        } else {
            el.innerText = `$ ${Math.round(valorNuevo).toLocaleString('es-AR')}`;
        }
    };

    requestAnimationFrame(actualizar);
}

// ======================================================
// FUNCIÓN PARA TRANSDORMAR "100000 EN "100.000 EN VIVO"
// ======================================================
function formatearInputConPuntos(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor !== "") {
        input.value = Number(valor).toLocaleString('es-AR');
    } else {
        input.value = "";
    }
}

// Función para obtener el número real limpio listo para cálculos
function obtenerNumeroLimpio(valorTexto) {
    if (!valorTexto) return 0;
    const limpio = valorTexto.replace(/\./g, "");
    return parseFloat(limpio) || 0;
}

// ==========================================
// OBTENER USUARIO ACTUAL
// ==========================================
function obtenerUsuarioActual() {
    try {
        return JSON.parse(sessionStorage.getItem('finanzly_usuario'));
    } catch (error) {
        console.error("❌ Error al obtener usuario de sesión:", error);
        return null;
    }
}

// ==========================================
// OBTENER TRANSACCIONES DEL USUARIO ACTUAL
// ==========================================
async function obtenerTransaccionesUsuario() {
    const usuario = obtenerUsuarioActual();

    if (!usuario?.id_usuario) {
        throw new Error("No hay un usuario iniciado.");
    }

    const res = await fetch(
        `/api/transacciones?id_usuario=${usuario.id_usuario}`
    );

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
            error.error || "No se pudieron obtener las transacciones."
        );
    }

    const transacciones = await res.json();

    if (!Array.isArray(transacciones)) {
        throw new Error("La respuesta de transacciones no es un array.");
    }

    return transacciones;
}

// ==========================================
// 2. CONFIGURACIÓN DE MODALES (Transacciones y Metas)
// ==========================================
function configurarModales() {
    // --- Lógica Modal Transacciones ---
    const modalTrans = document.getElementById('modal-transaccion');
    const abrirTrans = document.querySelectorAll('.btn-primary:not(#btn-anadir-limite), #openModal, .btn-nueva-transaccion, [onclick*="modal-transaccion"]');

    // --- Lógica Modal Abono a Meta ---
    const modalAbono = document.getElementById('modal-abono-meta');
    const inputAbono = document.getElementById('monto-abono');
    const btnRegar = document.getElementById('btn-regar-meta');
    const btnCerrarAbono = document.getElementById('close-abono-meta');

    if (inputAbono && btnRegar) {
        inputAbono.addEventListener('input', () => {
            formatearInputConPuntos(inputAbono);
            const monto = obtenerNumeroLimpio(inputAbono.value);
            btnRegar.disabled = monto <= 0;
        });
    }

    if (btnCerrarAbono) {
        btnCerrarAbono.onclick = () => { if(modalAbono) modalAbono.style.display = 'none'; };
    }

    // --- Lógica Modal Confirmar Eliminar Meta ---
    const modalEliminar = document.getElementById('modal-confirmar-eliminar');
    const btnCerrarEliminar = document.getElementById('close-confirmar-eliminar');
    const btnCancelarEliminar = document.getElementById('btn-cancelar-eliminar');
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    const modalEliminarTitle = document.getElementById('modal-confirmar-eliminar-title');
    const modalEliminarMessage = document.getElementById('modal-confirmar-eliminar-message');

    const resetEliminarModal = () => {
        if(modalEliminar) modalEliminar.style.display = 'none';
        idMetaEliminando = null;
        idTransaccionEliminando = null;
        idLimiteEliminando = null;
        if (modalEliminarTitle) modalEliminarTitle.innerText = '';
        if (modalEliminarMessage) modalEliminarMessage.innerText = '';
    };

    if (btnCerrarEliminar) btnCerrarEliminar.onclick = resetEliminarModal;
    if (btnCancelarEliminar) btnCancelarEliminar.onclick = resetEliminarModal;

    // ===========================
    // BOTÓN CONFIRMAR ELIMINACIÓN
    // ===========================
    if (btnConfirmarEliminar) {

    btnConfirmarEliminar.onclick = async () => {

        // ===============
        // ELIMINAR META
        // ===============

        if (idMetaEliminando !== null) {

            try {

                const usuario = obtenerUsuarioActual();

                if (!usuario?.id_usuario) {
                    console.error("❌ No hay un usuario iniciado.");
                    return;
                }

                console.log(
                    "🗑️ Intentando eliminar meta:",
                    idMetaEliminando
                );

                console.log(
                    "👤 Usuario que elimina:",
                    usuario.id_usuario
                );

                const res = await fetch(
                    `/api/metas/${idMetaEliminando}?id_usuario=${usuario.id_usuario}`,
                    {
                        method: 'DELETE'
                    }
                );

                const respuesta =
                    await res.json().catch(() => ({}));

                console.log(
                    "📡 Respuesta DELETE meta:",
                    res.status
                );

                console.log(
                    "📥 Respuesta servidor:",
                    respuesta
                );

                if (res.ok) {

                    modalEliminar.style.display = 'none';

                    idMetaEliminando = null;

                    console.log(
                        "✅ Meta eliminada correctamente"
                    );

                    // Recargar toda la aplicación
                    window.location.reload();

                } else {

                    console.error(
                        "❌ Error al eliminar meta:",
                        respuesta
                    );

                    alert(
                        respuesta.error ||
                        "No se pudo eliminar la meta."
                    );
                }

            } catch (e) {

                console.error(
                    "❌ Error al eliminar meta:",
                    e
                );

            }

            return;
        }


        // ==========================================================
        // ELIMINAR TRANSACCIÓN
        // ==========================================================

        if (idTransaccionEliminando !== null) {

            try {

                const usuario = obtenerUsuarioActual();

                if (!usuario?.id_usuario) {
                    console.error("❌ No hay un usuario iniciado.");
                    return;
                }

                console.log(
                    "🗑️ Intentando eliminar transacción:",
                    idTransaccionEliminando
                );

                console.log(
                    "👤 Usuario que elimina:",
                    usuario.id_usuario
                );

                const res = await fetch(
                    `/api/transacciones/${idTransaccionEliminando}?id_usuario=${usuario.id_usuario}`,
                    {
                        method: 'DELETE'
                    }
                );

                const respuesta =
                    await res.json().catch(() => ({}));

                console.log(
                    "📡 Respuesta DELETE transacción:",
                    res.status
                );

                console.log(
                    "📥 Respuesta servidor:",
                    respuesta
                );

                if (res.ok) {

                    modalEliminar.style.display = 'none';

                    idTransaccionEliminando = null;

                    console.log(
                        "✅ Transacción eliminada correctamente"
                    );

                    // Recargar toda la aplicación
                    window.location.reload();

                } else {

                    console.error(
                        "❌ Error al eliminar transacción:",
                        respuesta
                    );

                    alert(
                        respuesta.error ||
                        "No se pudo eliminar la transacción."
                    );
                }

            } catch (e) {

                console.error(
                    "❌ Error al eliminar transacción:",
                    e
                );

            }

            return;
        }


        // ==========================================================
        // ELIMINAR LÍMITE
        // ==========================================================

        if (idLimiteEliminando !== null) {

            try {

                const usuario = obtenerUsuarioActual();

                if (!usuario?.id_usuario) {
                    console.error("❌ No hay un usuario iniciado.");
                    return;
                }

                console.log(
                    "🗑️ Intentando eliminar límite:",
                    idLimiteEliminando
                );

                console.log(
                    "👤 Usuario que elimina:",
                    usuario.id_usuario
                );

                const res = await fetch(
                    `/api/limites/${idLimiteEliminando}?id_usuario=${usuario.id_usuario}`,
                    {
                        method: 'DELETE'
                    }
                );

                const respuesta =
                    await res.json().catch(() => ({}));

                console.log(
                    "📡 Respuesta DELETE límite:",
                    res.status
                );

                console.log(
                    "📥 Respuesta servidor:",
                    respuesta
                );

                if (res.ok) {

                    modalEliminar.style.display = 'none';

                    idLimiteEliminando = null;

                    console.log(
                        "✅ Límite eliminado correctamente"
                    );

                    // Recargar toda la aplicación
                    window.location.reload();

                } else {

                    console.error(
                        "❌ Error al eliminar límite:",
                        respuesta
                    );

                    alert(
                        respuesta.error ||
                        "No se pudo eliminar el límite."
                    );
                }

            } catch (e) {

                console.error(
                    "❌ Error al eliminar límite:",
                    e
                );

            }

            return;
        }


        // ==========================================================
        // NADA SELECCIONADO
        // ==========================================================

        console.log(
            "⚠️ No hay ningún elemento seleccionado para eliminar."
        );

    };
    }
    
    const cerrarTrans = document.querySelector('.close-btn');
    const montoTransInput = document.getElementById('monto-modal');
    const btnSubmitTrans = document.querySelector('#form-transaccion .btn-submit');
    const radioGastos = document.getElementById('tipo-gasto');
    const radioIngresos = document.getElementById('tipo-ingreso') || document.getElementById('tipo-income');
    const selectorCategoria = document.getElementById('categoria-modal');
    const contenedorDesc = document.getElementById('contenedor-descripcion');

    const categorias = {
        gasto: ['Servicios', 'Alimentos', 'Transporte','Seguros', 'Salud', 'Educación','Formación Profesional','Alquiler', 'Ocio', 'Otros'],
        ingreso: ['Sueldo', 'Inversiones', 'Aguinaldo', 'Planes / Subsidios', 'Otros']
    };

    function actualizarFormularioDinamico() {
        if (!selectorCategoria) return;
        selectorCategoria.innerHTML = '<option value="" disabled selected>Seleccionar categoría</option>';
        
        const esIngreso = radioIngresos?.checked;
        const lista = esIngreso ? categorias.ingreso : categorias.gasto;
        if (esIngreso) lista.push('Reintegro de Meta'); // Añadir la nueva categoría para ingresos
        lista.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.text = cat;
            selectorCategoria.add(opt);
        });
        evaluarVisibilidadDescripcion();
    }

    function evaluarVisibilidadDescripcion() {
        if (contenedorDesc && selectorCategoria) {
            const categoria = selectorCategoria.value;
            contenedorDesc.style.display = (categoria === 'Otros' || categoria === 'Transporte') ? 'block' : 'none';
        }
    }

    const validarMontoTrans = () => {
        if (btnSubmitTrans && montoTransInput) {
            const monto = obtenerNumeroLimpio(montoTransInput.value);
            btnSubmitTrans.disabled = monto <= 0;
        }
    };

    // Eventos Transacciones
    radioGastos?.addEventListener('click', actualizarFormularioDinamico);
    radioIngresos?.addEventListener('click', actualizarFormularioDinamico);
    selectorCategoria?.addEventListener('change', evaluarVisibilidadDescripcion);

    const abrirModalTrans = (e) => {
        e?.preventDefault();
        if (modalTrans) {
            modalTrans.style.display = 'flex';
            const fechaInput = document.getElementById('fecha-modal');
            if (fechaInput) {
                const hoy = new Date();
                const año = hoy.getFullYear();
                const mes = String(hoy.getMonth() + 1).padStart(2, '0');
                const dia = String(hoy.getDate()).padStart(2, '0');

                fechaInput.value = `${año}-${mes}-${dia}`;
            }
            actualizarFormularioDinamico();
            validarMontoTrans();
        }
    };

    abrirTrans.forEach(btn => btn.onclick = abrirModalTrans);
    if (cerrarTrans) cerrarTrans.onclick = () => modalTrans.style.display = 'none';

    // Formateo de miles en tiempo real para el monto de la transacción
    if (montoTransInput) montoTransInput.addEventListener('input', () => {
        formatearInputConPuntos(montoTransInput);
        validarMontoTrans();
    });

    // Definimos los elementos una sola vez (fuera de las funciones para que todos puedan verlos)
    const radioManual = document.getElementById('radio-manual');
    const radioAuto = document.getElementById('radio-auto');
    const inputFecha = document.getElementById('meta-fecha-fin');
    const inputMeses = document.getElementById('meta-meses');
    const inputSugerido = document.getElementById('meta-cuota');
    const inputMonto = document.getElementById('meta-monto');
    const inputActual = document.getElementById('meta-actual');

    function gestionarInputsPlazo() {
    // Protección: si el radio no existe en esta página, salimos de la función
    if (!radioManual) return; 

    const esManual = radioManual.checked;
    if (inputFecha) inputFecha.disabled = !esManual;
    if (inputMeses) inputMeses.disabled = esManual;
    
    calcularCuota();
    }

    function calcularCuota() {
    if (!inputMonto || !inputSugerido) return;

    const monto = obtenerNumeroLimpio(inputMonto.value);
    const actual = obtenerNumeroLimpio(inputActual ? inputActual.value : "0");
    const faltante = monto - actual;

    if (faltante <= 0 && monto > 0) {
        inputSugerido.value = "¡Meta alcanzada!";
        return;
    }

    let cuota = 0;
    // Problema 2: Detección estricta del radio seleccionado y su input correspondiente
    if (radioManual && radioManual.checked && inputFecha && inputFecha.value) {
        const fechaFin = new Date(inputFecha.value + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diffMeses = Math.max((fechaFin - hoy) / (1000 * 60 * 60 * 24 * 30.41), 0.1);
        cuota = faltante / diffMeses;
    } else if (radioAuto && radioAuto.checked && inputMeses && inputMeses.value > 0) {
        cuota = faltante / parseFloat(inputMeses.value);
    } else {
        inputSugerido.value = ""; // Limpiar si no hay datos suficientes
        return;
    }

    inputSugerido.value = "$ " + Math.round(cuota).toLocaleString('es-AR');
}

// 4. Agregar listeners (Problema 1: Vinculación correcta y disparo con formato)
radioManual?.addEventListener('change', gestionarInputsPlazo);
radioAuto?.addEventListener('change', gestionarInputsPlazo);

if (inputMonto) inputMonto.addEventListener('input', () => { formatearInputConPuntos(inputMonto); calcularCuota(); });
if (inputActual) inputActual.addEventListener('input', () => { formatearInputConPuntos(inputActual); calcularCuota(); });
if (inputFecha) inputFecha.addEventListener('input', calcularCuota);
if (inputMeses) inputMeses.addEventListener('input', calcularCuota);

// Inicialización
gestionarInputsPlazo();

    // --- Lógica Modal Metas ---
    // ==========================================
    // LOGICA DE MODAL METAS (CORREGIDA)
    // ==========================================
    // CORRECCIÓN: Este bloque se ejecuta dentro de configurarModales(), que es llamada
    // desde DOMContentLoaded. De este modo el DOM ya existe cuando se resuelven los
    // selectores, garantizando que btn-nueva-meta y modal-meta no sean null y que
    // el onclick de apertura y el botonCruz de cierre queden correctamente vinculados.
    const modalMeta = document.getElementById('modal-meta');
    const abrirMeta = document.getElementById('btn-nueva-meta');
    const cerrarMeta = document.getElementById('close-modal-meta') || document.querySelector('.modal-header .close-btn') || document.querySelector('[onclick*="modal-meta"]') || document.querySelector('.close-btn');

    // Selectores limpios (eliminando redundancia y selectores genéricos)
    const montoMetaInput = document.getElementById('meta-monto');
    const actualMetaInput = document.getElementById('meta-actual');
    const mesesMetaInput = document.getElementById('meta-meses'); 
    const fechaMetaInput = document.getElementById('meta-fecha-fin');
    const cuotaMetaInput = document.getElementById('meta-cuota');
    
    const contenedorMeses = document.getElementById('contenedor-meses-manual');
    const contenedorFecha = document.getElementById('contenedor-fecha-personalizada');

    const radiosPlazo = document.querySelectorAll('input[name="plazo-tipo"]');
    
    // CORRECCIÓN 2: Se unificó en un único forEach el manejo visual del radio activo
    // y la lógica de show/hide de contenedores, eliminando el bloque duplicado que
    // existía suelto a continuación y que provocaba estados inconsistentes del DOM.
    radiosPlazo.forEach(radio => {
        radio.addEventListener('change', function() {
            // Resetear estilo de todos los labels
            radiosPlazo.forEach(r => {
                const labelPadre = r.parentElement;
                if(labelPadre) {
                    labelPadre.style.borderColor = '#ccc';
                    labelPadre.style.backgroundColor = '#fff';
                    labelPadre.style.color = '#333';
                }
            });

            // Marcar el label activo
            const labelActivo = this.parentElement;
            if(labelActivo) {
                labelActivo.style.borderColor = '#00b4d8';
                labelActivo.style.backgroundColor = '#e0f7fa';
                labelActivo.style.color = '#0077b6';
            }

            // Mostrar u ocultar contenedores según el radio seleccionado
            if (this.value === 'personalizado') {
                if (contenedorFecha) contenedorFecha.style.display = 'block';
                if (contenedorMeses) contenedorMeses.style.display = 'none';
                if (mesesMetaInput) mesesMetaInput.removeAttribute('required');
                if (fechaMetaInput) fechaMetaInput.setAttribute('required', 'required');
            } else {
                if (contenedorFecha) contenedorFecha.style.display = 'none';
                if (contenedorMeses) contenedorMeses.style.display = 'block';
                if (fechaMetaInput) fechaMetaInput.removeAttribute('required');
                if (mesesMetaInput) {
                    mesesMetaInput.setAttribute('required', 'required');
                    if (this.value === 'corto') mesesMetaInput.value = 3;
                    if (this.value === 'mediano') mesesMetaInput.value = 6;
                    if (this.value === 'largo') mesesMetaInput.value = 24;
                }
            }
            calcularCuotaModal();
        });
    });

    // CALCULADORA EN VIVO SIN ERROR DE RESETEO (FALTA DE TIPIO)
    function calcularCuotaModal() {
        if (!montoMetaInput || !cuotaMetaInput) return;

        // Si el usuario todavía no escribió nada en el monto objetivo, dejamos la cuota vacía
        if (montoMetaInput.value.trim() === "") {
            cuotaMetaInput.value = "";
            return;
        }

        const objetivo = obtenerNumeroLimpio(montoMetaInput.value);
        const actual = obtenerNumeroLimpio(actualMetaInput ? actualMetaInput.value : "0");
        const faltante = objetivo - actual;

        // Si realmente escribió un número y el saldo es cero o menor, ya llegó
        if (faltante <= 0 && objetivo > 0) {
            cuotaMetaInput.value = "¡Ya llegaste!";
            return;
        }

        const radioSeleccionado = document.querySelector('input[name="plazo-tipo"]:checked');
        const tipoPlazo = radioSeleccionado ? radioSeleccionado.value : 'corto';

        // CORRECCIÓN 1: Se unificó la fórmula para ambas ramas (plazos fijos y personalizado)
        // restando siempre `actual` del `objetivo` antes de dividir, usando la variable
        // `faltante` ya calculada arriba. Antes, la rama de plazos fijos recalculaba el
        // faltante de forma inconsistente con respecto a la rama personalizada.
        if (tipoPlazo !== 'personalizado') {
            const meses = mesesMetaInput ? parseInt(mesesMetaInput.value) : 3;
            if (meses > 0) {
                const cuota = Math.round(faltante / meses);
                cuotaMetaInput.value = "$ " + cuota.toLocaleString('es-AR');
            } else {
                cuotaMetaInput.value = "";
            }
        } else {
            if (!fechaMetaInput || !fechaMetaInput.value) {
                cuotaMetaInput.value = "Selecciona una fecha";
                return;
            }

            const fechaFin = new Date(fechaMetaInput.value + 'T00:00:00');
            const fechaHoy = new Date();
            fechaHoy.setHours(0,0,0,0);

            const diferenciaMilisegundos = fechaFin - fechaHoy;
            const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

            if (diasRestantes <= 0) {
                cuotaMetaInput.value = "La fecha debe ser futura";
                return;
            }

            const mesesCalculados = Math.max(diasRestantes / 30.41, 0.1);
            const cuota = Math.round(faltante / mesesCalculados);
            cuotaMetaInput.value = "$ " + cuota.toLocaleString('es-AR');
        }
    }

    if (montoMetaInput) montoMetaInput.addEventListener('input', () => { formatearInputConPuntos(montoMetaInput); calcularCuotaModal(); });
    if (actualMetaInput) actualMetaInput.addEventListener('input', () => { formatearInputConPuntos(actualMetaInput); calcularCuotaModal(); });
    if (mesesMetaInput) mesesMetaInput.addEventListener('input', calcularCuotaModal);
    if (fechaMetaInput) fechaMetaInput.addEventListener('input', calcularCuotaModal);

    if (modalMeta) {
        if (abrirMeta) {
            abrirMeta.onclick = () => {
                idMetaEditando = null; 
                const formM = document.getElementById('form-meta');
                if (formM) formM.reset();
                
                const radioCorto = document.querySelector('input[name="plazo-tipo"][value="corto"]');
                if (radioCorto) {
                    radioCorto.checked = true;
                    radioCorto.dispatchEvent(new Event('change'));
                }

                const btnGuardar = modalMeta.querySelector('button[type="submit"]');
                const tituloModal = modalMeta.querySelector('h2') || modalMeta.querySelector('.modal-title');
                if(btnGuardar) btnGuardar.innerText = "Guardar Meta";
                if(tituloModal) tituloModal.innerText = "Configurar Nueva Meta";

                if (fechaMetaInput) fechaMetaInput.valueAsDate = new Date();
                if (cuotaMetaInput) cuotaMetaInput.value = ""; // Forzar vacío al iniciar
                modalMeta.style.display = 'flex';
            };
        }
        
        // Selector universal para el botón de cerrar de la cruz del modal
        const botonCruz = modalMeta.querySelector('.close-btn') || modalMeta.querySelector('span[onclick]');
        if (botonCruz) {
            botonCruz.onclick = () => modalMeta.style.display = 'none';
        }
    }

    window.onclick = (e) => {
        if (e.target === modalTrans) modalTrans.style.display = 'none';
        if (e.target === modalMeta) modalMeta.style.display = 'none';
        if (e.target === modalAbono) modalAbono.style.display = 'none';
        // El modal de eliminar ahora se resetea con la función resetEliminarModal
        if (e.target === modalEliminar) modalEliminar.style.display = 'none';
    };
}

// ==========================================
// 3. ENVÍO DE FORMULARIOS (API POST / PUT)
// ==========================================
function configurarFormularios() {
    const formTrans = document.getElementById('form-transaccion');

    if (formTrans) {
        formTrans.onsubmit = async (e) => {
            e.preventDefault();

            const radioTipo = document.querySelector(
                'input[name="tipo"]:checked'
            );

            const montoEl = document.getElementById('monto-modal');
            const catEl = document.getElementById('categoria-modal');
            const descEl = document.getElementById('descripcion-modal');
            const fechaEl = document.getElementById('fecha-modal');

            if (!radioTipo) {
                alert("Por favor, selecciona el tipo de transacción.");
                return;
            }

            const usuario = obtenerUsuarioActual();

            console.log("👤 USUARIO QUE GUARDA:", usuario);

            if (!usuario?.id_usuario) {
                alert("No hay un usuario iniciado.");
                return;
            }

            const tipoValor =
                radioTipo.value === 'gasto'
                    ? 'GASTO'
                    : 'INGRESO';

            let fechaValor = fechaEl
                ? fechaEl.value
                : "";

            if (!fechaValor) {

            const hoy = new Date();

                fechaValor =
                `${hoy.getFullYear()}-${String(
                    hoy.getMonth() + 1
                ).padStart(2, '0')}-${String(
                    hoy.getDate()
                ).padStart(2, '0')}`;
            }

            const categoriaValor = catEl
                ? catEl.value.trim()
                : "Otros";

            let idCategoria = null;

            try {

                // ==========================================
                // OBTENER CATEGORÍAS
                // ==========================================

                const resCategorias =
                    await fetch('/api/categorias');

                if (!resCategorias.ok) {
                 throw new Error(
                "No se pudieron obtener las categorías."
                    );
                }

                const categoriasBD =
                    await resCategorias.json();

                console.log(
                    "📂 CATEGORÍAS:",
                    categoriasBD
                );

                console.log(
                    "🔎 CATEGORÍA SELECCIONADA:",
                    categoriaValor
                );

                console.log(
                    "🔎 TIPO:",
                    tipoValor
                );

                // ==========================================
                // BUSCAR CATEGORÍA
                // ==========================================

                const categoriaEncontrada =
                    categoriasBD.find(c => {

                        const nombreBD =
                            String(c.nombre || '')
                                .trim()
                                .toLowerCase();

                        const tipoBD =
                            String(c.tipo || '')
                                .trim()
                                .toUpperCase();

                        return (
                            nombreBD ===
                            categoriaValor.toLowerCase() &&
                            tipoBD === tipoValor
                        );
                    });

                if (categoriaEncontrada) {

                    idCategoria =
                        categoriaEncontrada.id_categoria;

                    console.log(
                        "✅ CATEGORÍA ENCONTRADA:",
                        categoriaEncontrada
                    );
                }

            } catch (error) {

                console.error(
                    "❌ Error al obtener categorías:",
                    error
                );

                alert(
                    "No se pudieron cargar las categorías."
                );

                return;
            }

            // ==========================================
            // VALIDAR CATEGORÍA
            // ==========================================

            if (!idCategoria) {

                alert(
                   `No se encontró la categoría "${categoriaValor}".`
                );

                return;
            }

            // ==========================================
            // DESCRIPCIÓN
            // ==========================================

            const userDescriptionInput =
                descEl
                    ? descEl.value.trim()
                    : "";

            let descripcionFinal;

            const isDescriptionFieldVisible =
                categoriaValor.toLowerCase() === 'otros' ||
                categoriaValor.toLowerCase() === 'transporte';

            if (isDescriptionFieldVisible) {

                descripcionFinal =
                    userDescriptionInput || "-";

            } else {

                    descripcionFinal =
                 tipoValor === 'INGRESO'
                        ? `Ingreso por ${categoriaValor}`
                        : `Gasto en ${categoriaValor}`;
            }

            // ==========================================
            // DATOS DE LA TRANSACCIÓN
            // ==========================================

            const datos = {

                id_usuario:
                    usuario.id_usuario,

             id_categoria:
                 idCategoria,

                id_meta:
                    null,

                tipo:
                    tipoValor,

                monto:
                    obtenerNumeroLimpio(
                        montoEl
                            ? montoEl.value
                            : "0"
                    ),

                detalle:
                    descripcionFinal,

                fecha:
                    fechaValor
            };

            console.log(
                "📤 DATOS ENVIADOS:",
                datos
            );

            try {

                // ==========================================
                // GUARDAR EN EL BACKEND
                // ==========================================

                const res =
                    await fetch(
                        '/api/transacciones',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(datos)
                        }   
                    );

                const respuesta =
                    await res
                        .json()
                        .catch(() => ({}));

                console.log(
                    "📥 RESPUESTA DEL SERVIDOR:",
                    respuesta
                );

                console.log(
                    "📊 STATUS:",
                    res.status
                );

                // ==========================================
                // SI HUBO ERROR
                // ==========================================

                    if (!res.ok) {

                    console.error(
                        "❌ Error al guardar transacción:",
                        respuesta
                    );

                    alert(
                        respuesta.error ||
                        "No se pudo guardar la transacción."
                    );

                    return;
                }

                // ==========================================
                // TRANSACCIÓN GUARDADA
                // ==========================================

                console.log(
                    "✅ Transacción guardada correctamente"
                );

                    // ==========================================
                // CERRAR MODAL
                // ==========================================

                const modal =
                    document.getElementById(
                        'modal-transaccion'
                );

                if (modal) {
                    modal.style.display = 'none';
                }

                // ==========================================
                // LIMPIAR FORMULARIO
                // ==========================================

                formTrans.reset();

                const btnS =
                    formTrans.querySelector(
                        '.btn-submit'
                    );

                if (btnS) {
                    btnS.disabled = true;
                }

                // ==========================================
                // ACTUALIZAR INTERFAZ SIN F5

                await window.cargarGraficos();

                console.log(
                    "🔄 Finanzly actualizado sin recargar la página"
                );

            } catch (error) {

                console.error(
                 "❌ ERROR DE CONEXIÓN:",
                    error
                );

                alert(
                    "No se pudo conectar con el servidor.\n" +
                    "Revisá que el backend esté funcionando."
                );
            }
        };
    };
}


const formMeta = document.getElementById('form-meta');
if (formMeta) {
    formMeta.onsubmit = async (e) => {
        e.preventDefault();

        const radioSeleccionado = document.querySelector('input[name="plazo-tipo"]:checked');
        const radioManual = document.getElementById('radio-manual');

        const esPersonalizado =
            (radioSeleccionado && radioSeleccionado.value === 'personalizado') ||
            (radioManual && radioManual.checked);

        const inputFecha = document.getElementById('meta-fecha-fin');
        const inputMeses = document.getElementById('meta-meses');
        const inputCuota = document.getElementById('meta-cuota');

        const mesesSalvar = parseFloat(inputMeses.value) || 0;
        const fechaFinSalvar = esPersonalizado ? inputFecha.value : null;

        // Convertimos el plazo de la interfaz
        // al formato que acepta PostgreSQL
        const tipoPlazo = esPersonalizado ? 'FECHA' : 'MESES';

        const usuario = obtenerUsuarioActual();

        if (!usuario?.id_usuario) {
            alert("No hay un usuario iniciado.");
            return;
        }

        const datos = {
            id_usuario: usuario.id_usuario,

            nombre: document.getElementById('meta-nombre').value,

            monto_objetivo: obtenerNumeroLimpio(
                document.getElementById('meta-monto').value
            ),

            monto_actual: obtenerNumeroLimpio(
                document.getElementById('meta-actual').value
            ) || 0,

            meses_objetivo: esPersonalizado ? null : mesesSalvar,

            fecha_fin: esPersonalizado ? fechaFinSalvar : null,

            tipo_plazo: tipoPlazo
        };

        const url = idMetaEditando
            ? `/api/metas/${idMetaEditando}`
            : '/api/metas';

        const metodo = idMetaEditando ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const resultado = await res.json();

            if (res.ok) {
                console.log('✅ Meta guardada:', resultado);

                document.getElementById('modal-meta').style.display = 'none';

                formMeta.reset();

                idMetaEditando = null;

                // ==========================================================
                // RECARGAR TODA LA APLICACIÓN
                // ==========================================================

                console.log('🔄 Meta editada. Recargando Finanzly...');

            } else {
                console.error('❌ Error del servidor:', resultado);
                alert(resultado.error || 'No se pudo guardar la meta');
            }

        } catch (error) {
            console.error('❌ Error al guardar:', error);
        }
    };
    }

    const formAbono = document.getElementById('form-abono-meta');

    if (formAbono) {
    formAbono.onsubmit = async (e) => {
        e.preventDefault();

        const monto = obtenerNumeroLimpio(
            document.getElementById('monto-abono').value
        );

        if (monto <= 0 || !idMetaAbonando) return;

        try {
    // ==========================================
    // OBTENER USUARIO ACTUAL
    // ==========================================
    const usuario = obtenerUsuarioActual();

    if (!usuario?.id_usuario) {
        alert("No hay un usuario iniciado.");
        return;
    }

    // ==========================================
    // OBTENER LAS METAS DEL USUARIO
    // ==========================================
    const resGet = await fetch(
        `/api/metas?id_usuario=${usuario.id_usuario}`
    );

    if (!resGet.ok) {
        throw new Error(
            'No se pudieron obtener las metas'
        );
    }

    const metas = await resGet.json();

    // ==========================================
    // BUSCAR LA META
    // ==========================================
    const meta = metas.find(
        m => Number(m.id_meta) === Number(idMetaAbonando)
    );

    if (!meta) {
        console.error('❌ Meta no encontrada');
        return;
    }

    // ==========================================
    // CALCULAR NUEVO MONTO
    // ==========================================
    const nuevoActual =
        Number(meta.monto_actual) + Number(monto);

    // ==========================================
    // ACTUALIZAR META EN SUPABASE
    // ==========================================
    const resPut = await fetch(
        `/api/metas/${idMetaAbonando}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuario.id_usuario,
                nombre: meta.nombre,
                monto_objetivo: Number(meta.monto_objetivo),
                monto_actual: nuevoActual,
                meses_objetivo:
                    meta.meses_objetivo ?? null,
                fecha_fin:
                    meta.fecha_fin ?? null,
                tipo_plazo:
                    meta.tipo_plazo
            })
        }
    );

    const resultado =
        await resPut.json().catch(() => ({}));

    console.log(
        "📡 Respuesta PUT meta:",
        resPut.status
    );

    console.log(
        "📥 Resultado actualización:",
        resultado
    );

    if (!resPut.ok) {
        console.error(
            '❌ Error al actualizar meta:',
            resultado
        );

        alert(
            resultado.error ||
            'No se pudo actualizar la meta'
        );

        return;
    }

    console.log(
        '✅ Meta actualizada correctamente'
    );

    // ==========================================
    // REGISTRAR EL ABONO COMO TRASPASO
    // ==========================================
    const resMovimiento = await fetch(
        '/api/transacciones',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: usuario.id_usuario,
                id_meta: idMetaAbonando,
                tipo: 'TRASPASO',
                monto: Number(monto),
                detalle: `Ahorro para: ${meta.nombre}`,
                fecha: new Date().toISOString()
            })
        }
    );

    const resultadoMovimiento =
        await resMovimiento.json().catch(() => ({}));

    if (!resMovimiento.ok) {

        console.error(
            '❌ Error al registrar movimiento:',
            resultadoMovimiento
        );

    } else {

        console.log(
            '✅ Movimiento registrado en Supabase'
        );
    }

    // ==========================================
    // SONIDO DE CRECIMIENTO
    // ==========================================
    audioCrecimiento.play().catch(() => {});

    // ==========================================
    // CERRAR MODAL
    // ==========================================
    const modal =
        document.getElementById(
            'modal-abono-meta'
        );

    if (modal) {
        modal.style.display = 'none';
    }

    // ==========================================
    // LIMPIAR FORMULARIO
    // ==========================================
    formAbono.reset();

    idMetaAbonando = null;

    // ==========================================
    // ACTUALIZAR INTERFAZ
    // ==========================================
    await cargarMetas();

} catch (error) {

    console.error(
        '❌ Error al abonar a la meta:',
        error
    );

    alert(
        'Ocurrió un error al actualizar la meta.'
    );
}
    }

// ==========================================
// 4. LÓGICA DE RENDERS DE TARJETAS METAS
// ==========================================
async function cargarMetas() {

    const contenedor = document.getElementById('lista-metas');
    if (!contenedor) return;

        try {
            const usuario = obtenerUsuarioActual();

            if (!usuario?.id_usuario) {
                throw new Error("No hay un usuario iniciado.");
            }

            const resMetas = await fetch(`/api/metas?id_usuario=${usuario.id_usuario}`);

            if (!resMetas.ok) {
                throw new Error("No se pudieron obtener las metas.");
            }

            const metasBD = await resMetas.json();

            // Obtener solamente las transacciones del usuario actual
            const transacciones = await obtenerTransaccionesUsuario();

            console.log("METAS DESDE BD:", metasBD);
            console.log("TRANSACCIONES DESDE BD:", transacciones);


            const metas = metasBD.map(meta => ({
            ...meta,

            // Adaptamos Supabase al formato que ya utiliza la interfaz
            id: meta.id_meta,
            objetivo: Number(meta.monto_objetivo),
            actual: Number(meta.monto_actual),
            mesesObjetivo: meta.meses_objetivo,
            fechaFin: meta.fecha_fin ? meta.fecha_fin.substring(0, 10) : null,

            // Convertimos el tipo de plazo de la BD al formato visual de Finanzly
            plazo: meta.tipo_plazo === 'FECHA'
            ? 'Personalizado'
            : meta.meses_objetivo <= 3
            ? 'Corto'
            : meta.meses_objetivo <= 12
            ? 'Mediano'
            : 'Largo'
            }));

            if (metas.length === 0) {
                contenedor.innerHTML = '<div class="empty-state"><i>🎯</i><p>Aún no tienes metas. ¡Crea la primera para empezar a ahorrar!</p></div>';
            return;
            }   
        contenedor.innerHTML = '';

        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        
        const ahorroMes = transacciones
            .filter(t => {
                // Forzamos interpretación local para evitar saltos de mes por zona horaria
                const f = new Date(t.fecha);
                return f.getMonth() === mesActual && f.getFullYear() === anioActual;
            })
            .reduce((acc, t) => t.tipo.toLowerCase() === 'ingreso' ? acc + t.monto : acc - t.monto, 0);

            const gastoComida = transacciones
                .filter(t => {
                    const f = new Date(t.fecha);
                    return (t.categoria || '').toLowerCase() === 'comida'
                        && f.getMonth() === mesActual
                        && f.getFullYear() === anioActual;
                })
            .reduce((acc, t) => acc + t.monto, 0);

        metas.forEach(meta => {
            const porcentaje = (meta.actual / meta.objetivo) * 100;
            const porcentajeBarra = Math.min(porcentaje, 100); 
            const faltante = meta.objetivo - meta.actual;

            let textoSubtituloPlazo = "";
            let bloqueCuantificacion = "";
            let bloqueAsistente = "";
            let plazoTextColor = 'white'; // Color del texto para el plazo dentro del badge

            const esPorFecha = meta.fechaFin ? true : false;
            let diasRestantes = 0;

            // Obtener el activo del motor 'Mi Brote'
            const plantaSrc = obtenerPlantaPorPorcentaje(porcentaje);
            let huboEvolucion = false;

            // Si ya conocíamos esta meta y el icono cambió, ¡la planta evolucionó!
            if (estadosPlantasAnterior[meta.id] && estadosPlantasAnterior[meta.id] !== plantaSrc) {
                audioCrecimiento.currentTime = 0;
                audioCrecimiento.play().catch(() => {});
                huboEvolucion = true;
            }
            // Guardamos el estado actual para la próxima comparación
            estadosPlantasAnterior[meta.id] = plantaSrc;

            const plantaIconHTML = `<img src="${plantaSrc}" class="estado-planta robot-icon riego" alt="Mi Brote">`;
            
            // Mensajes de feedback (opcional: podrías integrarlos en el motor también)
            const mensajeEstado = porcentaje >= 100 ? '¡Cosecha lista! Has alcanzado tu meta.' : 'Tu ahorro está creciendo.';

            if (esPorFecha) {
                const fechaFinObj = new Date(meta.fechaFin + 'T00:00:00');
                const fechaHoyClon = new Date();
                fechaHoyClon.setHours(0,0,0,0);
                diasRestantes = Math.ceil((fechaFinObj - fechaHoyClon) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 0) {
                    textoSubtituloPlazo = "Fecha cumplida";
                    plazoTextColor = 'var(--red)'; // Rojo para metas vencidas
                } else if (diasRestantes <= 7) {
                    textoSubtituloPlazo = `Vence en ${diasRestantes} días`;
                    plazoTextColor = '#f59e0b'; // Naranja para metas a punto de vencer
                } else {
                    textoSubtituloPlazo = `Vence en ${diasRestantes} días`;
                }
            } else {
                textoSubtituloPlazo = `${meta.mesesObjetivo} meses`;
            }
            let colorBadge = '#10b981'; 
            if (meta.plazo === 'Mediano') colorBadge = '#3b82f6'; 
            if (meta.plazo === 'Largo') colorBadge = '#a855f7'; 
            if (meta.plazo === 'Personalizado') colorBadge = '#00b4d8';

            if (faltante <= 0) {
                bloqueCuantificacion = `
                    <div class="cuantificacion-box" style="border-left-color: #10b981;">
                        🎉 ¡Felicitaciones! Ya alcanzaste el monto total de este objetivo.
                    </div>
                `;
                bloqueAsistente = `
                    <div class="asistente-msg gold-robot">
                        ${plantaIconHTML}
                        <div><strong>Mi Brote:</strong> <span class="mensaje-texto">${mensajeEstado}</span></div>
                    </div>
                `;
            } else {
                const ahorroExtra = gastoComida * 0.20;

                if (esPorFecha) {
                    if (diasRestantes <= 0) {
                        bloqueCuantificacion = `<div class="cuantificacion-box" style="border-left-color: #ef4444;">⚠️ El plazo ya venció. Edita la meta para cambiar la fecha.</div>`;
                    } else if (diasRestantes <= 30) {
                        const cuotaDiaria = Math.round(faltante / diasRestantes);
                        bloqueCuantificacion = `
                            <div class="cuantificacion-box" style="border-left-color: #3b82f6;">
                                📅 Necesitás separar: <b style="color: #3b82f6;">$${cuotaDiaria.toLocaleString()} por DÍA</b>.
                            </div>
                        `;
                        const diasAlRitmoActual = Math.ceil(faltante / (ahorroMes / 30));
                        bloqueAsistente = `
                            <div class="asistente-msg">
                                ${plantaIconHTML}
                                <div><strong>Mi Brote:</strong> <span class="mensaje-texto">${mensajeEstado}</span> <br><small>Al ritmo actual llegas en ${diasAlRitmoActual} días.</small></div>
                            </div>
                        `;
                    } else {
                        const semanasRestantes = Math.ceil(diasRestantes / 7);
                        const cuotaSemanal = Math.round(faltante / semanasRestantes);
                        bloqueCuantificacion = `
                            <div class="cuantificacion-box" style="border-left-color: #3b82f6;">
                                🗓️ Necesitás separar: <b style="color: #3b82f6;">$${cuotaSemanal.toLocaleString()} por SEMANA</b>.
                            </div>
                        `;
                        const semanasAlRitmo = (faltante / (ahorroMes / 4.34)).toFixed(1);
                        bloqueAsistente = `
                            <div class="asistente-msg">
                                ${plantaIconHTML}
                                <div><strong>Mi Brote:</strong> <span class="mensaje-texto">${mensajeEstado}</span> <br><small>Al ritmo actual llegas en ${semanasAlRitmo} semanas.</small></div>
                            </div>
                        `;
                    }
                } 
                else {
                    const mesesPlazo = parseInt(meta.mesesObjetivo) || 1;
                    const cuotaMensualNecesaria = faltante / mesesPlazo;
                    
                    let textoAsistenteRitmo = "Sin ahorros registrados este mes.";
                    let mesesCalculados = 0;
                    let diasCalculados = 0;
                    let esMenorDeUnMes = false;
                    
                    if (ahorroMes > 0) {
                        mesesCalculados = faltante / ahorroMes;
                        if (mesesCalculados < 1) {
                            diasCalculados = Math.ceil(mesesCalculados * 30.41);
                            textoAsistenteRitmo = `Al ritmo de este mes llegás en solo <b>${diasCalculados} días</b>.`;
                            esMenorDeUnMes = true;
                        } else {
                            textoAsistenteRitmo = `Al ritmo de este mes llegás en <b>${mesesCalculados.toFixed(1)} meses</b>.`;
                        }
                    } else if (cuotaMensualNecesaria > 0) {
                        textoAsistenteRitmo = `Aportando la cuota sugerida, llegás en <b>${mesesPlazo} meses</b>.`;
                    }

                    let textoComidaSimulada = "";
                    if (ahorroExtra > 0 && ahorroMes > 0) {
                        const mesesSimulados = faltante / (ahorroMes + ahorroExtra);
                        if (esMenorDeUnMes) {
                            const diasSimulados = Math.ceil(mesesSimulados * 30.41);
                            const diasGanados = diasCalculados - diasSimulados;
                            if (diasGanados >= 1) textoComidaSimulada = ` ¡Si reducís 20% en comida ($${Math.round(ahorroExtra).toLocaleString()}), bajarías a <b>${diasSimulados} días</b>!`;
                        } else {
                            const mesesGanados = mesesCalculados - mesesSimulados;
                            if (mesesGanados >= 0.2) textoComidaSimulada = ` ¡Si reducís 20% en comida ($${Math.round(ahorroExtra).toLocaleString()}), bajarías a <b>${mesesSimulados.toFixed(1)} meses</b>!`;
                        }
                    }

                    bloqueCuantificacion = `
                        <div class="cuantificacion-box" style="border-left-color: #3b82f6;">
                            🎯 Cuota recomendada: <b style="color: #3b82f6;">$${Math.round(cuotaMensualNecesaria).toLocaleString()} por mes</b>.
                        </div>
                    `;
                    bloqueAsistente = `
                        <div class="asistente-msg">
                            ${plantaIconHTML}
                            <div><strong>Mi Brote:</strong> <span class="mensaje-texto">${mensajeEstado}</span> <br><small>${textoAsistenteRitmo}</small></div>
                        </div>
                    `;
                }
            }

            const parametrosEdicion = JSON.stringify(meta).replace(/"/g, '&quot;');

            const card = document.createElement('div');
            let urgenciaCls = '';
            if (esPorFecha && porcentaje < 100) {
                if (diasRestantes <= 0) urgenciaCls = ' danger';
                else if (diasRestantes <= 7) urgenciaCls = ' warning';
            }

            card.className = 'card goal-card' + urgenciaCls;
            card.setAttribute('data-id', meta.id);
            card.innerHTML = `
                <div class="goal-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem;">${meta.nombre}</h3>
                        <span class="badge-plazo" style="background-color: ${colorBadge}; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-top: 5px; display: inline-block;">
                            ${meta.plazo === 'Personalizado' ? 'Plazo Personalizado' : meta.plazo + ' Plazo'} (${textoSubtituloPlazo})
                        </span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                        <span style="font-weight: bold; color: #3b82f6; font-size: 1.1rem;">${porcentaje.toFixed(0)}%</span>
                        <div class="goal-actions" style="display: flex; gap: 6px;">
                            <button class="add-btn" onclick="abonarAMeta(${meta.id})" title="Abonar a la meta" style="background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px;">➕</button>
                            <button class="edit-btn" onclick="prepararEdicionMeta('${parametrosEdicion}')" style="background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px;">✏️</button>
                            <button class="delete-btn" onclick="eliminarMeta(${meta.id})" style="background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 2px;">🗑️</button>
                        </div>
                    </div>
                </div>
                <div class="progress-wrapper" style="background-color: #e2e8f0; border-radius: 6px; height: 8px; margin: 12px 0; overflow: hidden;">
                    <div class="progress-bar" style="width: 0%; height: 100%; background-color: #10b981; transition: width 1.5s cubic-bezier(0.1, 0.5, 0.5, 1);"></div>
                </div> 
                <div class="goal-footer" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; margin-bottom: 10px;">
                    <span>Guardado: <b>$${meta.actual.toLocaleString()}</b></span>
                    <span>Objetivo: <b>$${meta.objetivo.toLocaleString()}</b></span>
                </div>
                ${bloqueCuantificacion}
                ${bloqueAsistente}
            `;
            contenedor.appendChild(card); 

            // Si hubo evolución, disparamos los destellos sobre el nuevo mensaje
            if (huboEvolucion) {
                // Añadir efecto de sacudida a toda la tarjeta
                card.classList.add('card-evolution-shake');

                const msgContainer = card.querySelector('.asistente-msg');
                if (msgContainer) crearDestellos(msgContainer);

                const textoElemento = card.querySelector('.mensaje-texto');
                if (textoElemento) {
                    efectoEscritura(textoElemento, mensajeEstado);
                }
            }

            // Disparar la animación: pasamos de 0% al valor real con un pequeño delay para que el navegador lo detecte
            setTimeout(() => {
                const bar = card.querySelector('.progress-bar');
                if (bar) {
                    bar.style.width = `${porcentajeBarra}%`;
                    if (porcentaje >= 100) {
                        bar.classList.add('completed-glow');
                        
                        // Reproducir sonido de monedas cuando la barra termina de llenarse
                        bar.addEventListener('transitionend', () => {
                            audioMetaCompletada.currentTime = 0; // Reiniciar por si hay varias
                            audioMetaCompletada.play().catch(e => console.log("Audio bloqueado por el navegador hasta interacción del usuario"));
                        }, { once: true });
                    }
                }
            }, 100);
        });
    } catch (e) { 
        console.error(e); 
    }
}

function prepararEdicionMeta(metaString) {
    const meta = JSON.parse(metaString.replace(/&quot;/g, '"'));
    idMetaEditando = meta.id;
    
    const nombreEl = document.getElementById('meta-nombre');
    if(nombreEl) nombreEl.value = meta.nombre;
    
    const montoEl = document.getElementById('meta-monto');
    const actualEl = document.getElementById('meta-actual');
    
    if(montoEl) { montoEl.value = meta.objetivo; formatearInputConPuntos(montoEl); }
    if(actualEl) { actualEl.value = meta.actual; formatearInputConPuntos(actualEl); }

    let tipoRadioAActivar = "corto";
    if (meta.plazo === "Personalizado" || meta.fechaFin) {
        tipoRadioAActivar = "personalizado";
        const fechaFinEl = document.getElementById('meta-fecha-fin');
        if(fechaFinEl) fechaFinEl.value = meta.fechaFin;
    } else {
        const mesesEl = document.getElementById('meta-meses');
        if(mesesEl) mesesEl.value = meta.mesesObjetivo;
        if (meta.mesesObjetivo === 6) tipoRadioAActivar = "mediano";
        else if (meta.mesesObjetivo === 24) tipoRadioAActivar = "largo";
    }

    const radioASeleccionar = document.querySelector(`input[name="plazo-tipo"][value="${tipoRadioAActivar}"]`);
    if (radioASeleccionar) {
        radioASeleccionar.checked = true;
        radioASeleccionar.dispatchEvent(new Event('change'));
    }

    const modalMeta = document.getElementById('modal-meta');
    if(modalMeta) {
        const btnGuardar = modalMeta.querySelector('button[type="submit"]');
        if(btnGuardar) btnGuardar.innerText = "Actualizar Cambios";
        modalMeta.style.display = 'flex';
    }
}

function eliminarMeta(id) { // Función existente
    idMetaEliminando = id; // Guardamos el ID de la meta
    idTransaccionEliminando = null; // Limpiamos otros IDs
    idLimiteEliminando = null; // Limpiamos otros IDs

    const modal = document.getElementById('modal-confirmar-eliminar');
    const modalTitle = document.getElementById('modal-confirmar-eliminar-title');
    const modalMessage = document.getElementById('modal-confirmar-eliminar-message');

    if (modal && modalTitle && modalMessage) {
        modalTitle.innerText = `¿Eliminar Meta?`;
        modalMessage.innerText = `Esta acción es permanente y no se puede deshacer.`;
        modal.style.display = 'flex';
    }
}

function abonarAMeta(id) {
    idMetaAbonando = id;
    const modal = document.getElementById('modal-abono-meta');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('monto-abono');
        const btn = document.getElementById('btn-regar-meta');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
        if (btn) btn.disabled = true;
    }
}

// ==========================================
// 5. TRANSICIONES DE PÁGINA PROFESIONALES
// ==========================================
function configurarTransicionesPagina() {
    const linksNav = document.querySelectorAll('a.nav-item');
    const contenidoPrincipal = document.querySelector('.content');

    linksNav.forEach(link => {
        link.addEventListener('click', function(e) {
            const destino = this.getAttribute('href');

            // Solo interceptamos si es un enlace interno y no es la página actual
            if (destino && !destino.startsWith('#') && destino !== window.location.pathname.split('/').pop()) {
                e.preventDefault();
                contenidoPrincipal?.classList.add('fade-out-transition');

                setTimeout(() => {
                    window.location.href = destino;
                }, 400); // Debe coincidir con la duración en style.css
            }
        });
    });
}

/**
 * Gestiona la clase .active en los enlaces de navegación según la URL actual.
 */
function actualizarNavActiva() {
    const pathActual = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-item');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Normalizamos el href para comparar (ej: ./index.html -> index.html)
        const linkPath = href.split('/').pop() || 'index.html';
        
        if (linkPath === pathActual) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // VINCULAR BOTÓN DE TEMA
    // ==========================================
    document
        .getElementById('theme-toggle')
        ?.addEventListener('click', toggleDarkMode);


    // ==========================================
    // SINCRONIZAR UI INICIAL DEL BOTÓN/LOGO
    // ==========================================
    actualizarElementosTheme(
        document.body.classList.contains('dark-mode')
    );


    // ==========================================
    // CONFIGURACIONES INICIALES
    // ==========================================
    actualizarNavActiva();
    configurarModales();
    configurarFormularios();
    configurarTransicionesPagina();
    configurarResumenReporte();


    // ==========================================
    // CARGAR DATOS INICIALES
    // ==========================================
    cargarMetas();
    cargarTransacciones();


    // ==========================================
    // BOTÓN DE NOTIFICACIONES
    // ==========================================
    const botonNotificaciones =
        document.createElement('button');

    botonNotificaciones.type = 'button';

    botonNotificaciones.className =
        'floating-notification-btn';

    botonNotificaciones.setAttribute(
        'aria-label',
        'Ver notificaciones'
    );

    botonNotificaciones.title =
        'Ver notificaciones';

    botonNotificaciones.textContent = '🔔';


    // ==========================================
    // CLIC EN CAMPANITA
    // ==========================================
botonNotificaciones.addEventListener('click', async () => {

    try {

        const usuario = obtenerUsuarioActual();

        console.log("👤 USUARIO NOTIFICACIONES:", usuario);

        if (!usuario?.id_usuario) {

            showToast(
                'No hay un usuario iniciado.',
                'warning'
            );

            return;
        }

        const res = await fetch(
            `/api/notificaciones?id_usuario=${usuario.id_usuario}`
        );

        if (!res.ok) {
            throw new Error(
                'No se pudieron obtener las notificaciones.'
            );
        }

        const notificaciones = await res.json();

        console.log(
            "🔔 NOTIFICACIONES RECIBIDAS:",
            notificaciones
        );


        // ==========================================
        // NO HAY NOTIFICACIONES
        // ==========================================
        if (
            !Array.isArray(notificaciones) ||
            notificaciones.length === 0
        ) {

            showToast(
                'No tienes nuevas notificaciones.',
                'info'
            );

            return;
        }


        // ==========================================
        // MOSTRAR NOTIFICACIONES
        // ==========================================
        notificaciones.forEach(notificacion => {

            let tipoToast = 'info';

            if (notificacion.tipo === 'LIMITE') {
                tipoToast = 'warning';
            }

            if (notificacion.tipo === 'META') {
                tipoToast = 'success';
            }

            if (notificacion.tipo === 'ERROR') {
                tipoToast = 'error';
            }

            showToast(
                `${notificacion.titulo}: ${notificacion.mensaje}`,
                tipoToast
            );

        });

    } catch (error) {

        console.error(
            "❌ ERROR AL CARGAR NOTIFICACIONES:",
            error
        );

        showToast(
            'No se pudieron cargar las notificaciones.',
            'error'
        );
    }

});


    // ==========================================
    // AGREGAR CAMPANITA AL DOCUMENTO
    // ==========================================
    document.body.appendChild(
        botonNotificaciones
    );


    // ==========================================
    // NAVEGACIÓN VISTA SEMANAL
    // ==========================================
    document
        .getElementById('prev-week')
        ?.addEventListener('click', () => {

            audioClic.play().catch(() => {});

            weekOffset++;

            cargarGraficos();

        });


    document
        .getElementById('next-week')
        ?.addEventListener('click', () => {

            if (weekOffset > 0) {

                audioClic.play().catch(() => {});

                weekOffset--;

                cargarGraficos();

            }

        });


    // ==========================================
    // CARGAR GRÁFICOS Y COMPARATIVA
    // ==========================================
    cargarGraficos();

    renderizarComparativaMensual();


    // ==========================================
    // FILTRO DE BÚSQUEDA
    // ==========================================
    document
        .getElementById('filtro-busqueda')
        ?.addEventListener(
            'input',
            cargarTransacciones
        );


    // ==========================================
    // FILTRO POR TIPO
    // ==========================================
    document
        .getElementById('filtro-tipo')
        ?.addEventListener(
            'change',
            async function () {

                const selCat =
                    document.getElementById(
                        'filtro-categoria'
                    );


                if (!selCat) return;


                try {

                    const res =
                        await fetch('/api/categorias');


                    if (!res.ok) {

                        throw new Error(
                            'No se pudieron obtener las categorías'
                        );

                    }


                    const categorias =
                        await res.json();


                    const tipo =
                        this.value;


                    selCat.innerHTML =
                        '<option value="todas">Todas las Categorías</option>';


                    const lista =
                        tipo === 'todos'
                            ? categorias
                            : categorias.filter(
                                c =>
                                    c.tipo.toLowerCase() ===
                                    tipo
                            );


                    lista.forEach(cat => {

                        const opt =
                            document.createElement(
                                'option'
                            );

                        opt.value =
                            cat.nombre.toLowerCase();

                        opt.textContent =
                            cat.nombre;

                        selCat.appendChild(opt);

                    });


                } catch (error) {

                    console.error(
                        'Error al cargar categorías del filtro:',
                        error
                    );

                }


                cargarTransacciones();

            }
        );


    // ==========================================
    // CARGAR CATEGORÍAS AL ENTRAR
    // ==========================================
    const filtroTipo =
        document.getElementById(
            'filtro-tipo'
        );


    if (filtroTipo) {

        filtroTipo.dispatchEvent(
            new Event('change')
        );

    }


    // ==========================================
    // FILTRO POR CATEGORÍA
    // ==========================================
    document
        .getElementById('filtro-categoria')
        ?.addEventListener(
            'change',
            cargarTransacciones
        );


    // ==========================================
    // FILTRO DE FECHA
    // ==========================================
    inicializarFiltroFechaConMarcadores();


    // ==========================================
    // LIMPIAR FILTRO DE FECHA
    // ==========================================
    document
        .getElementById('btn-limpiar-fecha')
        ?.addEventListener(
            'click',
            () => {

                const input =
                    document.getElementById(
                        'filtro-fecha'
                    );


                if (
                    input &&
                    input._flatpickr
                ) {

                    input._flatpickr.clear();

                }

            }
        );

});

cargarTransacciones();{(
    document.getElementById('filtro-categoria')?.addEventListener('change', cargarTransacciones));
    inicializarFiltroFechaConMarcadores();

    // Botón para limpiar el filtro de fecha
    document.getElementById('btn-limpiar-fecha')?.addEventListener('click', () => {
        const input = document.getElementById('filtro-fecha');
        if (input && input._flatpickr) {
            input._flatpickr.clear();
        }
    });

};

// ==========================================================
// CARGAR TRANSACCIONES DEL USUARIO ACTUAL
// ==========================================================
async function cargarTransacciones() {

    const contenedor = document.getElementById('lista-transacciones');

    if (!contenedor) return;

    try {

        // ==================================================
        // OBTENER USUARIO ACTUAL
        // ==================================================
        const usuarioActual = JSON.parse(
            sessionStorage.getItem('finanzly_usuario')
        );

        if (!usuarioActual?.id_usuario) {
            console.error('❌ No hay un usuario iniciado.');
            return;
        }

        // ==================================================
        // OBTENER TRANSACCIONES DESDE LA BD
        // ==================================================
        const res = await fetch(
            `/api/transacciones?id_usuario=${usuarioActual.id_usuario}`
        );

        if (!res.ok) {
            throw new Error('No se pudieron obtener las transacciones.');
        }

        let trans = await res.json();

        // ==================================================
        // OBTENER FILTROS ACTUALES
        // ==================================================
        const q = document
            .getElementById('filtro-busqueda')
            ?.value
            .toLowerCase();

        const t = document
            .getElementById('filtro-tipo')
            ?.value;

        const c = document
            .getElementById('filtro-categoria')
            ?.value;

        const f = document
            .getElementById('filtro-fecha')
            ?.value;

        // ==================================================
        // SI NO HAY TRANSACCIONES
        // ==================================================
        if (trans.length === 0) {

            contenedor.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No hay transacciones registradas.
                    </td>
                </tr>
            `;

            return;
        }

        // ==================================================
        // FILTRO DE BÚSQUEDA
        // ==================================================
        if (q) {

            trans = trans.filter(tr =>
                String(tr.descripcion || '')
                    .toLowerCase()
                    .includes(q)
            );
        }

        // ==================================================
        // FILTRO POR TIPO
        // ==================================================
        if (t && t !== 'todos') {

            trans = trans.filter(tr =>
                String(tr.tipo || '').toLowerCase() === t
            );
        }

        // ==================================================
        // FILTRO POR CATEGORÍA
        // ==================================================
        if (c && c !== 'todas') {

            trans = trans.filter(tr =>
                String(tr.categoria || '').toLowerCase() ===
                c.toLowerCase()
            );
        }

        // ==================================================
        // FILTRO POR FECHA
        // ==================================================
        if (f) {

            trans = trans.filter(tr =>
                String(tr.fecha).substring(0, 10) === f
            );
        }

        // ==================================================
        // MOSTRAR TRANSACCIONES
        // ==================================================
        if (trans.length === 0) {

            contenedor.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No hay transacciones que coincidan con los filtros.
                    </td>
                </tr>
            `;

            return;
        }

        contenedor.innerHTML = trans.map(tr => `

            <tr>

                <!-- FECHA -->
                <td>
                    ${String(tr.fecha)
                        .substring(0, 10)
                        .split('-')
                        .reverse()
                        .join('/')}
                </td>

                <!-- TIPO -->
                <td>
                    <span class="badge ${
                        String(tr.tipo).toLowerCase() === 'gasto'
                            ? 'red'
                            : 'green'
                    }">
                        ${tr.tipo}
                    </span>
                </td>

                <!-- CATEGORÍA -->
                <td>
                    ${
                        tr.tipo === 'TRASPASO'
                            ? 'Meta'
                            : (tr.categoria || 'Sin categoría')
                    }
                </td>

                <!-- DESCRIPCIÓN -->
                <td>
                    ${tr.descripcion || '-'}
                </td>

                <!-- MONTO -->
                <td class="${
                    String(tr.tipo).toLowerCase() === 'gasto'
                        ? 'text-red'
                        : 'text-green'
                }">

                    $ ${parseFloat(tr.monto)
                        .toLocaleString('es-AR')}

                </td>

                <!-- ELIMINAR -->
                <td>

                    <button
                        onclick="eliminarTransaccion(${tr.id_movimiento})"
                        style="
                            border:none;
                            background:none;
                            cursor:pointer;
                        "
                    >
                        🗑️
                    </button>

                </td>

            </tr>

        `).join('');

    } catch (error) {

        console.error(
            "❌ Error cargando transacciones:",
            error
        );
    }
}


// ==========================================================
// ACTUALIZAR TODO EL DASHBOARD DESPUÉS DE UN MOVIMIENTO
// ==========================================================
async function actualizarDashboardDespuesDeMovimiento() {

    try {

        console.log("🔄 ACTUALIZANDO DASHBOARD...");

        // --------------------------------------------------
        // TRANSACCIONES
        // --------------------------------------------------
        if (typeof cargarTransacciones === 'function') {
            await cargarTransacciones();
        }

        // --------------------------------------------------
        // GRÁFICOS
        // --------------------------------------------------
        if (typeof cargarGraficos === 'function') {
            await cargarGraficos();
        }

        // --------------------------------------------------
        // LÍMITES
        // --------------------------------------------------
        if (typeof cargarLimites === 'function') {
            await cargarLimites();
        }

        // --------------------------------------------------
        // METAS
        // --------------------------------------------------
        if (typeof cargarMetas === 'function') {
            await cargarMetas();
        }

        // --------------------------------------------------
        // ALERTAS
        // --------------------------------------------------
        if (typeof window.actualizarAlertas === 'function') {
            await window.actualizarAlertas();
        }

        // --------------------------------------------------
        // COMPARATIVA MENSUAL
        // --------------------------------------------------
        if (
            typeof window.renderizarComparativaMensual === 'function'
        ) {
            await window.renderizarComparativaMensual();
        }

        // --------------------------------------------------
        // RESUMEN / SALDO
        // --------------------------------------------------
        if (typeof cargarResumen === 'function') {
            await cargarResumen();
        }

        if (typeof actualizarResumen === 'function') {
            await actualizarResumen();
        }

        console.log("✅ DASHBOARD ACTUALIZADO");

    } catch (error) {

        console.error(
            "❌ ERROR ACTUALIZANDO DASHBOARD:",
            error
        );
    }
} 

async function inicializarFiltroFechaConMarcadores() {
    const inputFecha = document.getElementById('filtro-fecha');
    if (!inputFecha || typeof flatpickr === 'undefined') return;

    try {
        const trans = await obtenerTransaccionesUsuario();

        // Creamos un mapa de actividad por fecha
        const mapaActividad = {};
        trans.forEach(t => {
            const montoNum = parseFloat(t.monto) || 0;

            // Normalizamos la fecha recibida desde Supabase a YYYY-MM-DD
            const fecha = String(t.fecha).substring(0, 10);

            if (!mapaActividad[fecha]) {
                mapaActividad[fecha] = {
                    ingresos: [],
                    gastos: [],
                    totalIng: 0,
                    totalGas: 0
                };
            }
            if (t.tipo.toLowerCase() === 'ingreso') {
                mapaActividad[fecha].ingresos.push(t);
                mapaActividad[fecha].totalIng += montoNum;
            } else {
                mapaActividad[fecha].gastos.push(t);
                mapaActividad[fecha].totalGas += montoNum;
            }
        });

        flatpickr(inputFecha, {
            locale: "es",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            placeholder: "Filtrar por fecha",
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                // Obtener fecha en formato YYYY-MM-DD local
                const d = dayElem.dateObj;
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                
                const act = mapaActividad[dateStr];
                if (act) {
                    if (act.totalIng > 0) {
                        const dot = document.createElement("span");
                        dot.className = "dot-indicador dot-ingreso";
                        
                        const items = act.ingresos.map(i => `
                            <div class="tooltip-item-row">
                                <span class="tooltip-item-desc">• ${i.descripcion}</span>
                                <span class="tooltip-item-monto">$${parseFloat(i.monto).toLocaleString('es-AR')}</span>
                            </div>`).join('');
                        
                        const html = `
                            <div style="color:var(--green); font-weight:800; font-size:0.65rem; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:4px;">Ingresos del Día</div>
                            <div style="max-height: 120px; overflow-y: auto; overflow-x: hidden;">${items}</div>
                            <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; font-weight:800; font-size:0.8rem;">
                                <span>TOTAL:</span><span>$${act.totalIng.toLocaleString('es-AR')}</span>
                            </div>`;
                        dot.addEventListener('mouseenter', (e) => {
                            audioHover.currentTime = 0;
                            audioHover.play().catch(() => {});
                            mostrarTooltipPersonalizado(e, html);
                        });
                        dot.addEventListener('mouseleave', ocultarTooltipPersonalizado);
                        
                        dayElem.appendChild(dot);
                    }
                     if (act.totalGas > 0) {
                        const dot = document.createElement("span");
                        dot.className = "dot-indicador dot-gasto";
                        
                        const items = act.gastos.map(g => `
                            <div class="tooltip-item-row">
                                <span class="tooltip-item-desc">• ${g.descripcion}</span>
                                <span class="tooltip-item-monto">$${parseFloat(g.monto).toLocaleString('es-AR')}</span>
                            </div>`).join('');

                        const html = `
                            <div style="color:var(--red); font-weight:800; font-size:0.65rem; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:4px;">Gastos del Día</div>
                            <div style="max-height: 120px; overflow-y: auto; overflow-x: hidden;">${items}</div>
                            <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; font-weight:800; font-size:0.8rem;">
                                <span>TOTAL:</span><span>$${act.totalGas.toLocaleString('es-AR')}</span>
                            </div>`;

                        dot.addEventListener('mouseenter', (e) => {
                            audioHover.currentTime = 0;
                            audioHover.play().catch(() => {});
                            mostrarTooltipPersonalizado(e, html);
                        });
                        dot.addEventListener('mouseleave', ocultarTooltipPersonalizado);
                        
                        dayElem.appendChild(dot);
                    }
                }
            },
            onChange: function(selectedDates) {
                const btnLimpiar = document.getElementById('btn-limpiar-fecha');
                if (btnLimpiar) {
                    if (selectedDates.length > 0) {
                        btnLimpiar.classList.remove('btn-pop-out');
                        btnLimpiar.classList.add('btn-pop-in');
                    } else {
                        btnLimpiar.classList.remove('btn-pop-in');
                        btnLimpiar.classList.add('btn-pop-out');
                        btnLimpiar.addEventListener('animationend', () => {
                            if (btnLimpiar.classList.contains('btn-pop-out')) btnLimpiar.style.display = 'none';
                        }, { once: true });
                    }
                }
                cargarTransacciones();
            }
        });
    } catch (e) {
        console.error("Error al inicializar marcadores de fecha:", e);
        }
}   


// ELIMINAR TRANSACCIÓN
async function eliminarTransaccion(id) {
    console.log("🆔 ID recibido:", id);

    idTransaccionEliminando = id;
    idMetaEliminando = null;
    idLimiteEliminando = null;

    const modal = document.getElementById('modal-confirmar-eliminar');
    const modalTitle = document.getElementById('modal-confirmar-eliminar-title');
    const modalMessage = document.getElementById('modal-confirmar-eliminar-message');

    console.log("🪟 Modal:", modal);
    console.log("📝 Título:", modalTitle);
    console.log("💬 Mensaje:", modalMessage);

    if (modal && modalTitle && modalMessage) {
        try {
            const transacciones = await obtenerTransaccionesUsuario();

            console.log("📊 Transacciones obtenidas:", transacciones);
            console.log("🔎 Buscando ID:", id);

            const transaccion = transacciones.find(
                t => String(t.id_movimiento) === String(id)
            );

            console.log("🎯 Transacción encontrada:", transaccion);

            if (transaccion) {
                modalTitle.innerText = '¿Eliminar Transacción?';

                modalMessage.innerHTML = `
                    Estás a punto de eliminar la transacción:
                    <br>
                    <strong>
                        ${transaccion.descripcion}
                        ($${Number(transaccion.monto).toLocaleString('es-AR')})
                    </strong>.
                    <br>
                    Esta acción es permanente y no se puede deshacer.
                `;

                modal.style.display = 'flex';

                console.log("✅ Modal abierto");
            } else {
                console.error("❌ No se encontró la transacción con ID:", id);
            }

        } catch (e) {
            console.error("❌ Error al obtener transacción para eliminar:", e);
        }
    }
}

// ==========================================================
// HACER DISPONIBLE LA FUNCIÓN PARA EL HTML
// ==========================================================

window.eliminarTransaccion = eliminarTransaccion;


window.cargarGraficos = async function() {
    const balanceEl = document.getElementById('balance-total');
    if (!balanceEl) return;
    try {
        const trans = await obtenerTransaccionesUsuario();
        let i = 0, g = 0; 
        const cats = {}; 
        const diasData = {}; // Objeto para agrupar ingresos/gastos por fecha

        trans.forEach(t => {
    const m = parseFloat(t.monto) || 0;
    const tipo = String(t.tipo || '').toLowerCase();

    if (tipo === 'ingreso') {
        i += m;
    } else if (tipo === 'gasto') {
        g += m;
        cats[t.categoria] = (cats[t.categoria] || 0) + m;
    }

    const fecha = String(t.fecha).substring(0, 10);

    if (!diasData[fecha]) {
        diasData[fecha] = { ingreso: 0, gasto: 0 };
    }

    if (tipo === 'ingreso') {
        diasData[fecha].ingreso += m;
    } else if (tipo === 'gasto') {
        diasData[fecha].gasto += m;
    }
    });

        // ==========================================
        // ACTUALIZAR SALDO, INGRESOS Y GASTOS
        // ==========================================

        const nuevoBalance = i - g;

        // Animar valores
        animarSaldo('balance-total', lastBalance, nuevoBalance);
        animarSaldo('ingresos-total', lastIncome, i);
        animarSaldo('gastos-total', lastExpenses, g);

        // Guardar los nuevos valores
        lastBalance = nuevoBalance;
        lastIncome = i;
        lastExpenses = g;

        console.log("🔄 RESUMEN ACTUALIZADO:", {
            ingresos: i,
            gastos: g,
            saldo: nuevoBalance
        });

        cargarCalendario(trans);
        
        const ctxCat = document.getElementById('chartCategorias')?.getContext('2d');
        if (ctxCat) {
            if (myChartDonut) myChartDonut.destroy();

            const catsKeys = Object.keys(cats);
            const dataValues = Object.values(cats);
            const totalGasto = dataValues.reduce((acc, val) => acc + val, 0);

            // Cálculo para etiquetas profesionales (Nombre + Monto + %)
            const labelsPro = catsKeys.map(cat => {
                const valor = cats[cat];
                const porcentaje = totalGasto > 0 ? ((valor / totalGasto) * 100).toFixed(1) : 0;
                return `${cat}: $${valor.toLocaleString('es-AR')} (${porcentaje}%)`;
            });

            myChartDonut = new Chart(ctxCat, {
                type: 'doughnut',
                data: { 
                    labels: labelsPro, 
                    datasets: [{ 
                        data: dataValues, 
                        backgroundColor: catsKeys.map(cat => coloresCategorias[cat] || '#94a3b8')
                    }] 
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 2000,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            position: 'right', // Posición lateral profesional
                            labels: {
                                usePointStyle: true, // Usa círculos en vez de cuadrados
                                padding: 20,
                                boxWidth: 10,
                                font: { size: 12, family: "'Inter', sans-serif" }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const nombre = context.label.split(':')[0];
                                    const valor = context.parsed;
                                    return ` ${nombre}: $${valor.toLocaleString('es-AR')}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Inicialización del Gráfico de Vista Semanal (Barras)
        const ctxBars = document.getElementById('grafico-semanal')?.getContext('2d');
        if (ctxBars) {
            if (chartSemanal) chartSemanal.destroy();
            
            // Generamos las 7 fechas consecutivas (Lunes a Domingo) para la semana seleccionada
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const day = hoy.getDay(); 
            const diffToMonday = (day === 0) ? 6 : day - 1;
            
            const inicioSemanaActual = new Date(hoy);
            inicioSemanaActual.setDate(hoy.getDate() - diffToMonday);

            const inicioSemanaSeleccionada = new Date(inicioSemanaActual);
            inicioSemanaSeleccionada.setDate(inicioSemanaActual.getDate() - (weekOffset * 7));
            
            const fechasOrdenadas = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(inicioSemanaSeleccionada);
                d.setDate(inicioSemanaSeleccionada.getDate() + i);
                fechasOrdenadas.push(d.toISOString().split('T')[0]);
            }

            // Actualizar estado visual de los botones de navegación
            const btnPrev = document.getElementById('prev-week');
            const btnNext = document.getElementById('next-week');
            
            // Deshabilitamos 'Anterior' si la fecha más vieja de la semana es anterior a la primera transacción
            const allFechasExistentes = Object.keys(diasData).sort();
            if (btnPrev) {
                const fechaMasAntigua = allFechasExistentes.length > 0 ? allFechasExistentes[0] : fechasOrdenadas[0];
                btnPrev.disabled = fechasOrdenadas[0] <= fechaMasAntigua;
            }
            if (btnNext) btnNext.disabled = (weekOffset === 0);
            
            // Actualizar el indicador de rango de fechas
            const rangeEl = document.getElementById('semana-rango');
            if (rangeEl) {
                if (fechasOrdenadas.length > 0) {
                    const options = { day: 'numeric', month: 'short' };
                    const firstDate = new Date(fechasOrdenadas[0] + 'T00:00:00');
                    const lastDate = new Date(fechasOrdenadas[fechasOrdenadas.length - 1] + 'T00:00:00');
                    rangeEl.innerText = `Semana del ${firstDate.toLocaleDateString('es-AR', options)} al ${lastDate.toLocaleDateString('es-AR', options)}`;
                } else {
                    rangeEl.innerText = 'Sin transacciones registradas';
                }
            }

            // Transformar las fechas ISO a etiquetas legibles (ej: "Lun 12")
            const labelsDisplay = fechasOrdenadas.map(f => {
                const d = new Date(f + 'T00:00:00');
                let weekday = d.toLocaleDateString('es-AR', { weekday: 'short' });
                weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '');
                return `${weekday} ${d.getDate()}`;
            });

            chartSemanal = new Chart(ctxBars, {
                type: 'bar',
                data: {
                    labels: labelsDisplay,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: fechasOrdenadas.map(f => diasData[f]?.ingreso || 0),
                            backgroundColor: fechasOrdenadas.map(f => (diasData[f]?.gasto || 0) > (diasData[f]?.ingreso || 0) ? '#94a3b8' : '#10b981'),
                            borderRadius: 6
                        },
                        {
                            label: 'Gastos',
                            data: fechasOrdenadas.map(f => diasData[f]?.gasto || 0),
                            backgroundColor: fechasOrdenadas.map(f => (diasData[f]?.gasto || 0) > (diasData[f]?.ingreso || 0) ? '#ef4444' : '#fca5a5'),
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                footer: (tooltipItems) => {
                                    const dataIndex = tooltipItems[0].dataIndex;
                                    const fecha = fechasOrdenadas[dataIndex];
                                    const dataDia = diasData[fecha] || { ingreso: 0, gasto: 0 };
                                    if (dataDia.gasto > dataDia.ingreso) {
                                        return '⚠️ Día en Déficit';
                                    }
                                }
                            }
                        }
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    } catch (e) { console.error(e); }
}

/**
 * Inicializa o actualiza el calendario interactivo con las transacciones.
 */
function cargarCalendario(transacciones) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // --- REPLICAMOS MAPA DE ACTIVIDAD PARA EL TOOLTIP ---
    const mapaActividad = {};
    transacciones.forEach(t => {
        const montoNum = parseFloat(t.monto) || 0;
        const fecha = String(t.fecha).substring(0, 10);
        if (!mapaActividad[fecha]) {
            mapaActividad[fecha] = {
                ingresos: [],
                gastos: [],
                totalIng: 0,
                totalGas: 0
            };
        }
        if (t.tipo.toLowerCase() === 'ingreso') {
        mapaActividad[fecha].ingresos.push(t);
        mapaActividad[fecha].totalIng += montoNum;
        } 
        else {
        mapaActividad[fecha].gastos.push(t);
        mapaActividad[fecha].totalGas += montoNum;
        }
    });
    const eventos = transacciones.map(t => {
        let color = '#10b981'; // Verde predefinido para ingresos
        if (t.tipo.toLowerCase() === 'gasto') {
            // Buscamos el color en el mapa, o usamos el rojo de gastos por defecto
            color = coloresCategorias[t.categoria] || '#ef4444'; 
        }
        return {
            title: `$${t.monto}`,
            start: String(t.fecha).substring(0, 10),
            backgroundColor: color,
            borderColor: 'transparent',
            extendedProps: { tipo: t.tipo.toLowerCase() } // Guardamos tipo para el tooltip
        };
    });
    if (calendar) {
        calendar.destroy();
    }
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        buttonText: {
            today: 'Hoy'
        },
        events: eventos,
        dayCellDidMount: function(info) {
            const dateStr = obtenerFechaLocal(info.date);
            const html = crearDetalleDia(mapaActividad, dateStr);
            if (!html) return;

            info.el.addEventListener('mouseenter', (event) => {
                audioHover.currentTime = 0;
                audioHover.play().catch(() => {});
                mostrarTooltipPersonalizado(event, html);
            });
            info.el.addEventListener('mouseleave', ocultarTooltipPersonalizado);
        },
        eventMouseEnter: function(info) {
            audioHover.currentTime = 0;
            audioHover.play().catch(() => {});
            const dateStr = String(info.event.startStr).substring(0, 10);
            const act = mapaActividad[dateStr];
            if (!act) return;

            const tipo = info.event.extendedProps.tipo;
            let html = '';

            if (tipo === 'ingreso') {
            const items = act.ingresos.map(i => {
            const color = coloresCategorias[i.categoria] || '#10b981';
            return `
            <div class="tooltip-item-row">
            <span class="tooltip-item-desc">
            <span style="color:${color}; font-size:1rem;">●</span>
                    ${i.descripcion}
                    </span>
                    <span class="tooltip-item-monto">$${parseFloat(i.monto).toLocaleString('es-AR')}</span>
                    </div>`;
            }).join('');
                
                html = `
                    <div style="color:var(--green); font-weight:800; font-size:0.65rem; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:4px;">Ingresos del Día</div>
                    <div style="max-height: 120px; overflow-y: auto; overflow-x: hidden;">${items}</div>
                    <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; font-weight:800; font-size:0.8rem;">
                        <span>TOTAL:</span><span>$${act.totalIng.toLocaleString('es-AR')}</span>
                    </div>`;
            } else {
            const items = act.gastos.map(g => {
                const color = coloresCategorias[g.categoria] || '#ef4444';

                return `
                <div class="tooltip-item-row">
                    <span class="tooltip-item-desc">
                        <span style="color:${color}; font-size:1rem;">●</span>
                        ${g.descripcion}
                    </span>
                    <span class="tooltip-item-monto">$${parseFloat(g.monto).toLocaleString('es-AR')}</span>
                </div>`;
            }).join('');

                html = `
                    <div style="color:var(--red); font-weight:800; font-size:0.65rem; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:4px;">Gastos del Día</div>
                    <div style="max-height: 120px; overflow-y: auto; overflow-x: hidden;">${items}</div>
                    <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; font-weight:800; font-size:0.8rem;">
                        <span>TOTAL:</span><span>$${act.totalGas.toLocaleString('es-AR')}</span>
                    </div>`;
            }
            mostrarTooltipPersonalizado(info.jsEvent, html);
        },
        eventMouseLeave: function() {
            ocultarTooltipPersonalizado();
        }
    });

    calendar.render();
}

/**
 * Genera una comparativa interactiva entre los meses seleccionados.
 */
window.renderizarComparativaMensual = async function() {
    const container = document.getElementById('comparativa-container');
    const sel1 = document.getElementById('select-mes-1');
    const sel2 = document.getElementById('select-mes-2');
    if (!container || !sel1 || !sel2) return;

    try {
        const trans = await obtenerTransaccionesUsuario();
        if (!trans.length) return;

        // 1. Extraer periodos únicos (Año-Mes) para los selectores
        const periodosMap = {};
        const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        
        trans.forEach(t => {

            const d = new Date(t.fecha);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!periodosMap[key]) periodosMap[key] = `${nombresMeses[d.getMonth()]} ${d.getFullYear()}`;
        });

        const periodosOrdenados = Object.keys(periodosMap).sort().reverse();

        // 2. Poblar selectores (Refrescar siempre para incluir meses nuevos como Julio)
        const val1 = sel1.value;
        const val2 = sel2.value;

        const opciones = periodosOrdenados.map(p => `<option value="${p}">${periodosMap[p]}</option>`).join('');
        sel1.innerHTML = opciones;
        sel2.innerHTML = opciones;

        // Intentar mantener la selección previa si el periodo aún existe
        if (val1 && periodosOrdenados.includes(val1)) {
            sel1.value = val1;
        } else if (periodosOrdenados[1]) {
            sel1.value = periodosOrdenados[1]; // Mes anterior por defecto
        }

        if (val2 && periodosOrdenados.includes(val2)) {
            sel2.value = val2;
        } else {
            sel2.value = periodosOrdenados[0]; // Mes actual por defecto
        }

        const formatVar = (nuevo, antiguo) => {
            const diff = nuevo - antiguo;
            if (diff === 0) return { txt: '0.0%', icon: '•', cls: 'neutral' };
            if (antiguo === 0) return { txt: nuevo > 0 ? '+100%' : '-100%', icon: nuevo > 0 ? '↑' : '↓', cls: nuevo > 0 ? 'up' : 'down' };
            
            const v = (diff / antiguo) * 100;
            const label = (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
            return { txt: label, icon: v >= 0 ? '↑' : '↓', cls: v >= 0 ? 'up' : 'down' };
        };

        const updateUI = () => {
            const data1 = obtenerDatosComparativa(trans, sel1.value);
            const data2 = obtenerDatosComparativa(trans, sel2.value);

            const label1 = periodosMap[sel1.value].split(' ')[0];
            const label2 = periodosMap[sel2.value].split(' ')[0];
            
            // Lógica de colores para gastos (si sube es malo, si baja es bueno)
            const statIng = formatVar(data2.ing, data1.ing);
            const statGas = formatVar(data2.gas, data1.gas);
            
            // Sobrescribimos clase de gasto para sentido financiero
            const gasCls = statGas.cls === 'neutral' ? 'neutral' : (data2.gas <= data1.gas ? 'ok' : 'warn');

            container.innerHTML = `
                <div class="comparativa-row animate-fade-in">
                    <div class="periodo-block">
                        <span class="mes-label">${label1}</span>
                        <div class="monto-item"><small>Ingresos</small><p class="text-green">$${data1.ing.toLocaleString()}</p></div>
                        <div class="monto-item"><small>Gastos</small><p class="text-red">$${data1.gas.toLocaleString()}</p></div>
                    </div>
                    <div class="comparativa-divider" title="Intercambiar periodos">⇄</div>
                    <div class="periodo-block">
                        <span class="mes-label">${label2}</span>
                        <div class="monto-item">
                            <small>Ingresos</small>
                            <p class="text-green">$${data2.ing.toLocaleString()} 
                            <span class="var-badge ${statIng.cls}">${statIng.icon} ${statIng.txt}</span></p>
                        </div>
                        <div class="monto-item">
                            <small>Gastos</small>
                            <p class="text-red">$${data2.gas.toLocaleString()} 
                            <span class="var-badge ${gasCls}">${statGas.icon} ${statGas.txt}</span></p>
                        </div>
                    </div>
                </div>
            `;

            // Funcionalidad para intercambiar meses al hacer clic en el botón central
            container.querySelector('.comparativa-divider')?.addEventListener('click', () => {
                const tempVal = sel1.value;
                sel1.value = sel2.value;
                sel2.value = tempVal;
                updateUI();
            });

            // Actualizar los insights automáticamente al renderizar la UI
            generarInsights(data1, data2);
        };

        sel1.onchange = updateUI;
        sel2.onchange = updateUI;
        updateUI();

    } catch (e) {
        console.error("Error en comparativa mensual:", e);
    }
}

/**
 * Genera mensajes automáticos comparando dos periodos.
 */
function generarInsights(data1, data2) {
    const container = document.getElementById('comparativa-insights');
    if (!container) return;

    const diffIng = data2.ing - data1.ing;
    const diffGas = data2.gas - data1.gas;
    
    // Formateador de moneda es-AR con decimales
    const f = (val) => `$ ${Math.abs(val).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let html = '';

    // Análisis de Ingresos
    if (diffIng > 0) {
        html += `
            <div class="insight-item insight-positive">
                <span class="insight-icon">💰</span>
                <span>Tus ingresos aumentaron <strong>${f(diffIng)}</strong> respecto al mes anterior. ¡Excelente trabajo!</span>
            </div>`;
    } else if (diffIng < 0) {
        html += `
            <div class="insight-item insight-negative">
                <span class="insight-icon">📉</span>
                <span>Tus ingresos disminuyeron <strong>${f(diffIng)}</strong>. Revisa tus fuentes de entrada.</span>
            </div>`;
    }

    // Análisis de Gastos
    if (diffGas < 0) {
        html += `
            <div class="insight-item insight-positive">
                <span class="insight-icon">👍</span>
                <span>¡Ahorro detectado! Gastaste <strong>${f(diffGas)}</strong> menos que el periodo pasado.</span>
            </div>`;
    } else if (diffGas > 0) {
        html += `
            <div class="insight-item insight-negative">
                <span class="insight-icon">⚠️</span>
                <span>Tus gastos subieron <strong>${f(diffGas)}</strong>. Considera ajustar tu presupuesto.</span>
            </div>`;
    }

    container.innerHTML = html;
}

function obtenerDatosComparativa(trans, periodo) {
    const filter = trans.filter(t => {
        const fecha = String(t.fecha).substring(0, 7);
        return fecha === periodo;
    });

    return {
        ing: filter
            .filter(t => String(t.tipo || '').toLowerCase() === 'ingreso')
            .reduce((s, t) => s + (parseFloat(t.monto) || 0), 0),

        gas: filter
            .filter(t => String(t.tipo || '').toLowerCase() === 'gasto')
            .reduce((s, t) => s + (parseFloat(t.monto) || 0), 0)
    };
}

/**
 * Calcula totales y muestra el modal de resumen basado en la lista actual filtrada.
 */
async function abrirModalResumen(e) {
    if (e) e.preventDefault(); // Evitamos cualquier comportamiento por defecto

    const modal = document.getElementById('modal-resumen');
    const infoContainer = document.getElementById('resumen-info');
    if (!modal || !infoContainer) return;

    // FEEDBACK INSTANTÁNEO: Abrimos el modal ya mismo con un mensaje de carga
    modal.style.display = 'flex';
    infoContainer.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p style="color:var(--text-muted); margin-top:15px; font-weight: 500;">Generando resumen...</p>
        </div>
    `;

    try {
        let trans = await obtenerTransaccionesUsuario();
        
        // Sincronizar con los filtros aplicados en la interfaz
        const q = document.getElementById('filtro-busqueda')?.value.toLowerCase();
        const t = document.getElementById('filtro-tipo')?.value;
        const c = document.getElementById('filtro-categoria')?.value;

        if (q) trans = trans.filter(tr => tr.descripcion.toLowerCase().includes(q));
        if (t && t !== 'todos') trans = trans.filter(tr => tr.tipo.toLowerCase() === t);
        if (c && c !== 'todas') trans = trans.filter(tr => tr.categoria.toLowerCase() === c);

        let ingresos = 0, gastos = 0;
        const gastosPorCat = {};

        trans.forEach(tr => {
            const monto = parseFloat(tr.monto) || 0;
            if (tr.tipo.toLowerCase() === 'ingreso') ingresos += monto;
            else { 
                gastos += monto;
                gastosPorCat[tr.categoria] = (gastosPorCat[tr.categoria] || 0) + monto;
            }
        });

        infoContainer.innerHTML = `
            <div style="margin: 20px 0; border: 1px solid var(--border); padding: 15px; border-radius: 10px; background: rgba(0,0,0,0.02);">
                <p style="display:flex; justify-content:space-between; margin: 8px 0;"><span>Total Ingresos:</span> <b class="text-green">$ ${ingresos.toLocaleString('es-AR')}</b></p>
                <p style="display:flex; justify-content:space-between; margin: 8px 0;"><span>Total Gastos:</span> <b class="text-red">$ ${gastos.toLocaleString('es-AR')}</b></p>
                <div style="border-top: 1px solid var(--border); margin: 10px 0; padding-top: 10px; display:flex; justify-content:space-between; font-weight: bold;">
                    <span>Balance Neto:</span> <span>$ ${(ingresos - gastos).toLocaleString('es-AR')}</span>
                </div>
            </div>
            <div class="chart-container" style="height: 250px; margin-bottom: 20px; display: ${Object.keys(gastosPorCat).length > 0 ? 'block' : 'none'};">
                <canvas id="chart-resumen-categorias"></canvas>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Basado en ${trans.length} transacciones filtradas.</p>
        `;

        modal.dataset.tempTrans = JSON.stringify(trans);
        modal.dataset.tempResumen = JSON.stringify({ ingresos, gastos, total: ingresos - gastos, gastosPorCat });

        // Renderizar el gráfico si hay gastos
        if (Object.keys(gastosPorCat).length > 0) {
            const ctx = document.getElementById('chart-resumen-categorias').getContext('2d');
            if (chartResumenCategorias) chartResumenCategorias.destroy();
            
            const resumenKeys = Object.keys(gastosPorCat);
            const resumenColors = resumenKeys.map(cat => coloresCategorias[cat] || '#94a3b8');

            chartResumenCategorias = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: resumenKeys,
                    datasets: [{
                        data: Object.values(gastosPorCat),
                        backgroundColor: resumenColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 12, padding: 15, font: { size: 11, family: "'Inter', sans-serif" } }
                        }
                    }
                }
            });
        }
    } catch (e) { console.error("Error al cargar resumen:", e); }
}

/**
 * Configura los eventos del reporte de resumen de forma aislada mediante IDs.
 */
function configurarResumenReporte() {
    document.getElementById('btn-resumen-reporte')?.addEventListener('click', abrirModalResumen);
    
    document.getElementById('close-resumen')?.addEventListener('click', () => {
        document.getElementById('modal-resumen').style.display = 'none';
    });

    document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
        const modal = document.getElementById('modal-resumen');
        const res = JSON.parse(modal.dataset.tempResumen || '{}');
        const trans = JSON.parse(modal.dataset.tempTrans || '[]');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setProperties({
            title: 'Resumen Financiero - Finanzly',
            subject: 'Informe académico de ingresos, gastos y balance',
            author: 'Finanzly',
            creator: 'Finanzly'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        const green = [45, 122, 70];
        const emerald = [16, 185, 129];
        const gold = [210, 154, 26];
        const red = [239, 68, 68];
        const ink = [30, 41, 59];
        const muted = [100, 116, 139];
        const light = [248, 250, 252];
        const formatMoney = value => `$${Number(value || 0).toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        const addLogo = () => new Promise(resolve => {
            const logo = new Image();
            logo.onload = () => {
                doc.addImage(logo, 'PNG', margin, 8, 16, 16);
                resolve();
            };
            logo.onerror = resolve;
            logo.src = 'finanzly_verde.png';
        });
        const drawHeader = () => {
            doc.setFillColor(...green);
            doc.rect(0, 0, pageWidth, 30, 'F');
            doc.setFillColor(...gold);
            doc.rect(0, 30, pageWidth, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(17);
            doc.text('FINANZLY', margin + 20, 15);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text('GESTIÓN INTELIGENTE', margin + 20, 22);
            doc.setFontSize(8);
            doc.text('INFORME FINANCIERO', pageWidth - margin, 15, { align: 'right' });
        };
        const drawFooter = pageNumber => {
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, pageHeight - 17, pageWidth - margin, pageHeight - 17);
            doc.setTextColor(...muted);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text('Finanzly | Gestión inteligente de tus finanzas', margin, pageHeight - 10);
            doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        drawHeader();
        await addLogo();

        doc.setTextColor(...ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Resumen ejecutivo', margin, 49);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...muted);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} | ${trans.length} movimientos analizados`, margin, 57);

        const cards = [
            { label: 'TOTAL INGRESOS', value: formatMoney(res.ingresos), color: emerald },
            { label: 'TOTAL GASTOS', value: formatMoney(res.gastos), color: red },
            { label: 'BALANCE NETO', value: formatMoney(res.total), color: green }
        ];
        const cardWidth = (pageWidth - margin * 2 - 10) / 3;

        cards.forEach((card, index) => {
            const x = margin + index * (cardWidth + 5);
            doc.setFillColor(...light);
            doc.roundedRect(x, 68, cardWidth, 38, 3, 3, 'F');
            doc.setFillColor(...card.color);
            doc.roundedRect(x, 68, 3, 38, 1.5, 1.5, 'F');
            doc.setTextColor(...muted);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.text(card.label, x + 10, 80);
            doc.setTextColor(...ink);
            doc.setFontSize(12);
            doc.text(card.value, x + 10, 96);
        });

        const totalGasto = Number(res.gastos || 0);
        const totalIngreso = Number(res.ingresos || 0);
        const ahorroRate = totalIngreso > 0 ? ((Number(res.total || 0) / totalIngreso) * 100) : 0;
        doc.setTextColor(...ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Indicadores de gestión', margin, 126);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...muted);
        doc.text(`Tasa de ahorro: ${ahorroRate.toFixed(1)}%`, margin, 137);
        doc.text(`Promedio por movimiento: ${formatMoney(trans.length ? (totalIngreso + totalGasto) / trans.length : 0)}`, margin + 70, 137);
        doc.text(`Categorías con gastos: ${Object.keys(res.gastosPorCat || {}).length || 'N/D'}`, margin + 145, 137);

        doc.setTextColor(...ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Distribución de gastos por categoría', margin, 157);
        const gastosPorCat = res.gastosPorCat || {};
        const categorias = Object.entries(gastosPorCat).sort((a, b) => b[1] - a[1]);
        const maxCategorias = Math.min(categorias.length, 8);
        categorias.slice(0, maxCategorias).forEach(([categoria, monto], index) => {
            const y = 168 + index * 9;
            const porcentaje = totalGasto > 0 ? (monto / totalGasto) * 100 : 0;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...ink);
            doc.text(categoria.substring(0, 23), margin, y);
            doc.setFillColor(226, 232, 240);
            doc.roundedRect(margin + 48, y - 4, 83, 3, 1.5, 1.5, 'F');
            doc.setFillColor(...green);
            doc.roundedRect(margin + 48, y - 4, Math.max(1, 83 * porcentaje / 100), 3, 1.5, 1.5, 'F');
            doc.setTextColor(...muted);
            doc.text(`${porcentaje.toFixed(1)}%  ${formatMoney(monto)}`, margin + 137, y);
        });
        if (!categorias.length) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...muted);
            doc.text('No hay gastos registrados en el periodo seleccionado.', margin, 169);
        }

        const tableStart = 168 + Math.max(maxCategorias, 1) * 9 + 14;
        doc.setTextColor(...ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Detalle de movimientos', margin, tableStart);
        const columns = [margin, 40, 70, 112, 174];
        const headers = ['FECHA', 'TIPO', 'CATEGORÍA', 'DESCRIPCIÓN', 'MONTO'];
        doc.setFillColor(...green);
        doc.rect(margin, tableStart + 6, pageWidth - margin * 2, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        headers.forEach((header, index) => doc.text(header, columns[index] + 2, tableStart + 13));

        let y = tableStart + 24;
        let pageNumber = 1;
        trans.forEach((movimiento, index) => {
            if (y > pageHeight - 28) {
                drawFooter(pageNumber);
                doc.addPage();
                pageNumber++;
                drawHeader();
                y = 47;
                doc.setFillColor(...green);
                doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
                doc.setTextColor(255, 255, 255);
                headers.forEach((header, headerIndex) => doc.text(header, columns[headerIndex] + 2, y + 7));
                y += 18;
            }
            if (index % 2 === 0) {
                doc.setFillColor(...light);
                doc.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');
            }
            doc.setTextColor(...ink);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text(String(movimiento.fecha || '').substring(0, 10), columns[0] + 2, y);
            doc.setTextColor(...(movimiento.tipo.toLowerCase() === 'gasto' ? red : emerald));
            doc.text(String(movimiento.tipo || '').toUpperCase(), columns[1] + 2, y);
            doc.setTextColor(...ink);
            doc.text(String(movimiento.categoria || '').substring(0, 19), columns[2] + 2, y);
            doc.text(String(movimiento.descripcion || '').substring(0, 29), columns[3] + 2, y);
            doc.text(formatMoney(movimiento.monto), columns[4] + 2, y);
            y += 10;
        });

        drawFooter(pageNumber);
        const chartCanvas = document.getElementById('chart-resumen-categorias');
        if (chartCanvas && categorias.length) {
            doc.addPage();
            pageNumber++;
            drawHeader();
            doc.setTextColor(...ink);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Análisis visual', margin, 50);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...muted);
            doc.text('Distribución proporcional de los gastos registrados', margin, 58);
            doc.setFillColor(...light);
            doc.roundedRect(margin, 68, pageWidth - margin * 2, 105, 4, 4, 'F');
            doc.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 35, 77, 140, 88);

            const mayorGasto = categorias[0];
            const balanceTexto = Number(res.total || 0) >= 0
                ? 'El periodo presenta un balance positivo.'
                : 'El periodo presenta un balance negativo y requiere revisión.';
            doc.setTextColor(...ink);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Lectura del periodo', margin, 195);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...muted);
            doc.text(balanceTexto, margin, 206);
            doc.text(`La categoría con mayor participación es ${mayorGasto[0]} (${((mayorGasto[1] / totalGasto) * 100).toFixed(1)}%).`, margin, 216);
            doc.text(`El informe considera ${trans.length} movimientos y un volumen total de ${formatMoney(totalIngreso + totalGasto)}.`, margin, 226);
            doc.setTextColor(...green);
            doc.setFont('helvetica', 'bold');
            doc.text('Recomendación: revisa periódicamente las categorías de mayor peso para tomar decisiones informadas.', margin, 242);
            drawFooter(pageNumber);
        }
        doc.save("Resumen_Finanzly.pdf");
    });

    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
        const trans = JSON.parse(document.getElementById('modal-resumen').dataset.tempTrans || '[]');
        const dataExcel = trans.map(({id, ...resto}) => resto);
        const ws = XLSX.utils.json_to_sheet(dataExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
        XLSX.writeFile(wb, "Reporte_Finanzly.xlsx");
    });
}

// ==========================================
// SECCIÓN: ALERTAS DE PRESUPUESTO (MODULAR)
// ==========================================

/**
 * Calcula y renderiza el estado de los presupuestos en el dashboard de forma reactiva.
 */
window.actualizarAlertas = async function() {
    const contenedor = document.getElementById('contenedor-alertas');
    if (!contenedor) return;

    try {
        // ==========================================
        // OBTENER USUARIO ACTUAL
        // ==========================================
        const usuario = obtenerUsuarioActual();

        if (!usuario?.id_usuario) {
            console.error("❌ No hay un usuario iniciado.");
            return;
        }

        const transacciones = await obtenerTransaccionesUsuario();

        // ==========================================
        // OBTENER SOLO LOS LÍMITES DEL USUARIO
        // ==========================================
        const resLimites = await fetch(
            `/api/limites?id_usuario=${usuario.id_usuario}`
        );

        if (!resLimites.ok) {
            throw new Error('No se pudieron obtener los límites');
        }

        const limitesDB = await resLimites.json();

        console.log("📊 LÍMITES DEL USUARIO:", limitesDB);

        const limites = {};

        limitesDB.forEach(limite => {
            if (
                limite.categoria &&
                Number(limite.monto_limite) > 0
            ) {
                limites[limite.categoria] = Number(limite.monto_limite);
            }
        });

        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        // ==========================================
        // AGRUPAR GASTOS DEL MES ACTUAL
        // ==========================================
        const gastosPorCat = transacciones
            .filter(t => {
                const fecha = String(t.fecha).substring(0, 10);
                const [anio, mes] = fecha.split('-').map(Number);

                return (
                    t.tipo.toLowerCase() === 'gasto' &&
                    mes === mesActual + 1 &&
                    anio === anioActual
                );
            })
            .reduce((acc, t) => {
                acc[t.categoria] =
                    (acc[t.categoria] || 0) + Number(t.monto);

                return acc;
            }, {});

        const categoriasConLimite = Object.keys(limites)
            .filter(c => limites[c] > 0);

        if (categoriasConLimite.length === 0) {
            contenedor.innerHTML = `
                <div class="estado-vacio">
                    <div class="icono-vacio">⚙️</div>
                    <p>
                        Sin límites configurados aún.<br>
                        Añade un límite para recibir alertas.
                    </p>
                </div>
            `;
            return;
        }

        // ==========================================
        // GENERAR ALERTAS
        // ==========================================
        contenedor.innerHTML = categoriasConLimite.map(cat => {

            const gasto = gastosPorCat[cat] || 0;
            const limite = parseFloat(limites[cat]);

            const porcentaje = Math.min(
                (gasto / limite) * 100,
                100
            );

            let cls = '';
            let barStyle = `width: ${porcentaje}%`;
            let statusTxt = '';
            let statusColor = '';
            let bubbleStyle = '';
            let itemExtraCls = '';

            const isDark =
                document.body.classList.contains('dark-mode');

            const alpha = isDark ? 0.08 : 0.15;
            const borderAlpha = isDark ? 0.2 : 0.4;

            if (porcentaje < 70) {

                cls = 'alert-safe';
                statusTxt = "Dentro del límite";
                statusColor = "var(--primary)";

                bubbleStyle =
                    `background-color: rgba(16, 185, 129, ${alpha});
                     border-color: rgba(16, 185, 129, ${borderAlpha});`;

                if (notifiedAlerts[cat]) {
                    notifiedAlerts[cat]['warning'] = false;
                    notifiedAlerts[cat]['error'] = false;
                }

            } else if (porcentaje < 100) {

                const ratio = (porcentaje - 70) / 30;

                const r = Math.round(
                    245 + (239 - 245) * ratio
                );

                const g = Math.round(
                    158 + (68 - 158) * ratio
                );

                const b = Math.round(
                    11 + (68 - 11) * ratio
                );

                const colorRGB = `${r}, ${g}, ${b}`;

                barStyle +=
                    `; background-color: rgb(${colorRGB})`;

                statusTxt = "Cerca del límite";
                statusColor = "#f59e0b";

                bubbleStyle =
                    `background-color: rgba(${colorRGB}, ${alpha});
                     border-color: rgba(${colorRGB}, ${borderAlpha});`;

                showToast(
                    `¡Atención! Estás cerca de tu límite de ${cat}. ` +
                    `Llevas $${gasto.toLocaleString('es-AR')}.`,
                    'warning',
                    cat
                );

                if (notifiedAlerts[cat]) {
                    notifiedAlerts[cat]['error'] = false;
                }

            } else {

                cls = 'completed-glow';
                statusTxt = "¡Límite superado!";
                statusColor = "var(--red)";

                bubbleStyle =
                    `background-color: rgba(239, 68, 68, ${alpha});
                     border-color: rgba(239, 68, 68, ${borderAlpha});`;

                itemExtraCls = 'alert-item-pulse';

                showToast(
                    `¡Alerta! Has superado tu límite de ${cat} ` +
                    `por $${(gasto - limite).toLocaleString('es-AR')}.`,
                    'error',
                    cat
                );

                if (notifiedAlerts[cat]) {
                    notifiedAlerts[cat]['warning'] = false;
                }
            }

            return `
                <div class="alert-item ${itemExtraCls}" style="${bubbleStyle}">
                    <div class="alert-info">

                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span
                                class="cat-color-dot"
                                style="background-color: ${coloresCategorias[cat] || '#94a3b8'}">
                            </span>

                            <span>${cat}</span>
                        </div>

                        <div
                            style="
                                text-align: right;
                                display: flex;
                                flex-direction: column;
                                align-items: flex-end;
                            "
                        >

                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                "
                            >

                                <span
                                    style="
                                        font-size: 0.65rem;
                                        color: ${statusColor};
                                        font-weight: 800;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    "
                                >
                                    ${statusTxt}
                                </span>

                                <button
                                    onclick="eliminarLimite('${cat}')"
                                    class="delete-alert-btn"
                                    title="Eliminar límite"
                                >
                                    🗑️
                                </button>

                            </div>

                            <span>
                                $${gasto.toLocaleString('es-AR')}
                                /
                                $${limite.toLocaleString('es-AR')}
                                (${porcentaje.toFixed(0)}%)
                            </span>

                        </div>

                    </div>

                    <div class="alert-progress-bg">
                        <div
                            class="alert-progress-fill ${cls}"
                            style="${barStyle}"
                        ></div>
                    </div>
                </div>
            `;

        }).join('');

    } catch (e) {
        console.error(
            "Error en Alertas de Presupuesto:",
            e
        );
    }
};

// ==========================================================
// ELIMINAR LÍMITE POR CATEGORÍA
// ==========================================================

window.eliminarLimite = async function(categoria) {

    idMetaEliminando = null;
    idTransaccionEliminando = null;
    idLimiteEliminando = null;

    try {

        // ==========================================================
        // OBTENER USUARIO ACTUAL
        // ==========================================================

        const usuario = obtenerUsuarioActual();

        if (!usuario?.id_usuario) {
            console.error("❌ No hay un usuario iniciado.");
            return;
        }

        console.log(
            "🗑️ Intentando eliminar límite de:",
            categoria
        );

        console.log(
            "👤 Usuario:",
            usuario.id_usuario
        );

        // ==========================================================
        // OBTENER LÍMITES DEL USUARIO ACTUAL
        // ==========================================================

        const res = await fetch(
            `/api/limites?id_usuario=${usuario.id_usuario}`
        );

        const respuesta =
            await res.json().catch(() => []);

        console.log(
            "📡 Respuesta límites:",
            res.status
        );

        if (!res.ok) {

            console.error(
                "❌ Error al obtener límites:",
                respuesta
            );

            alert(
                respuesta.error ||
                "No se pudieron obtener los límites."
            );

            return;
        }

        const limites = respuesta;

        console.log(
            "📊 LÍMITES DEL USUARIO:",
            limites
        );

        // ==========================================================
        // BUSCAR EL LÍMITE DE LA CATEGORÍA
        // ==========================================================

        const limite = limites.find(l => {

            const categoriaBD =
                String(l.categoria || '')
                    .trim()
                    .toLowerCase();

            const categoriaSeleccionada =
                String(categoria || '')
                    .trim()
                    .toLowerCase();

            return categoriaBD === categoriaSeleccionada;
        });

        if (!limite) {

            console.error(
                "❌ No se encontró el límite de:",
                categoria
            );

            alert(
                `No se encontró un límite para la categoría "${categoria}".`
            );

            return;
        }

        // ==========================================================
        // GUARDAR ID REAL DEL LÍMITE
        // ==========================================================

        idLimiteEliminando = limite.id_limite;

        console.log(
            "🆔 ID REAL DEL LÍMITE:",
            idLimiteEliminando
        );

        // ==========================================================
        // ABRIR MODAL DE CONFIRMACIÓN
        // ==========================================================

        const modal =
            document.getElementById(
                'modal-confirmar-eliminar'
            );

        const modalTitle =
            document.getElementById(
                'modal-confirmar-eliminar-title'
            );

        const modalMessage =
            document.getElementById(
                'modal-confirmar-eliminar-message'
            );

        if (modal && modalTitle && modalMessage) {

            modalTitle.innerText =
                `¿Eliminar límite de ${categoria}?`;

            modalMessage.innerText =
                `Esta acción eliminará el límite de presupuesto ` +
                `para la categoría ${categoria} y no se puede deshacer.`;

            modal.style.display = 'flex';

            console.log(
                "✅ Modal de eliminación abierto"
            );
        }

    } catch (error) {

        console.error(
            "❌ Error al obtener límite:",
            error
        );

        alert(
            "Ocurrió un error al intentar obtener el límite."
        );
    }
};


    // Lógica de inicialización segura del componente de Presupuesto
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // BOTÓN DE NOTIFICACIONES
    // ==========================================

    let botonNotificaciones =
        document.querySelector('.floating-notification-btn');

    if (!botonNotificaciones) {

        botonNotificaciones = document.createElement('button');

        botonNotificaciones.type = 'button';
        botonNotificaciones.className = 'floating-notification-btn';
        botonNotificaciones.setAttribute(
            'aria-label',
            'Ver notificaciones'
        );
        botonNotificaciones.title = 'Ver notificaciones';
        botonNotificaciones.textContent = '🔔';

        botonNotificaciones.addEventListener('click', async () => {

            try {

                const usuario = obtenerUsuarioActual();

                console.log(
                    "👤 USUARIO NOTIFICACIONES:",
                    usuario
                );

                if (!usuario?.id_usuario) {
                    showToast(
                        'No hay un usuario iniciado.',
                        'warning'
                    );
                    return;
                }

                const res = await fetch(
                    `/api/notificaciones?id_usuario=${usuario.id_usuario}`
                );

                if (!res.ok) {
                    throw new Error(
                        'No se pudieron obtener las notificaciones.'
                    );
                }

                const notificaciones = await res.json();

                console.log(
                    "🔔 NOTIFICACIONES RECIBIDAS:",
                    notificaciones
                );

                if (
                    !Array.isArray(notificaciones) ||
                    notificaciones.length === 0
                ) {
                    showToast(
                        'No tienes nuevas notificaciones.',
                        'info'
                    );
                    return;
                }

                notificaciones.forEach(notificacion => {

                    let tipoToast = 'info';

                    if (notificacion.tipo === 'LIMITE') {
                        tipoToast = 'warning';
                    }

                    if (notificacion.tipo === 'META') {
                        tipoToast = 'success';
                    }

                    if (notificacion.tipo === 'ERROR') {
                        tipoToast = 'error';
                    }

                    showToast(
                        `${notificacion.titulo}: ${notificacion.mensaje}`,
                        tipoToast
                    );

                });

            } catch (error) {

                console.error(
                    "❌ ERROR AL CARGAR NOTIFICACIONES:",
                    error
                );

                showToast(
                    'No se pudieron cargar las notificaciones.',
                    'error'
                );
            }

        });

        document.body.appendChild(botonNotificaciones);
    }


    // ==========================================
    // ELEMENTOS DE LÍMITES
    // ==========================================

    const btnAnadir =
        document.getElementById('btn-anadir-limite');

    const modalNuevo =
        document.getElementById('modal-nuevo-limite');

    const formNuevo =
        document.getElementById('form-nuevo-limite');

    const btnCerrar =
        document.getElementById('close-nuevo-limite');

    const inputMontoNuevo =
        document.getElementById('nuevo-limite-monto');


    // ==========================================
    // BOTÓN AÑADIR LÍMITE
    // ==========================================

    if (btnAnadir && modalNuevo) {

        btnAnadir.addEventListener('click', () => {
            modalNuevo.style.display = 'flex';
        });

    }


    // ==========================================
    // FORMATEAR MONTO
    // ==========================================

    if (inputMontoNuevo) {

        inputMontoNuevo.addEventListener('input', () => {
            formatearInputConPuntos(inputMontoNuevo);
        });

    }


    // ==========================================
    // CERRAR MODAL
    // ==========================================

    if (btnCerrar && modalNuevo) {

        btnCerrar.addEventListener('click', () => {
            modalNuevo.style.display = 'none';
        });

    }


    // ==========================================
    // GUARDAR NUEVO LÍMITE
    // ==========================================

    if (formNuevo) {

        formNuevo.onsubmit = async (e) => {

            e.preventDefault();

            try {

                // ==========================================
                // OBTENER USUARIO ACTUAL
                // ==========================================

                const usuario = obtenerUsuarioActual();

                console.log(
                    "👤 USUARIO QUE CREA LÍMITE:",
                    usuario
                );

                if (!usuario?.id_usuario) {

                    alert(
                        "No hay un usuario iniciado."
                    );

                    return;
                }


                // ==========================================
                // OBTENER DATOS DEL FORMULARIO
                // ==========================================

                const categoria =
                    document
                        .getElementById('nuevo-limite-categoria')
                        .value;

                const monto =
                    obtenerNumeroLimpio(
                        document
                            .getElementById('nuevo-limite-monto')
                            .value
                    );


                if (!categoria) {

                    alert(
                        "Seleccioná una categoría."
                    );

                    return;
                }


                if (!monto || monto <= 0) {

                    alert(
                        "Ingresá un monto válido."
                    );

                    return;
                }


                // ==========================================
                // OBTENER CATEGORÍAS
                // ==========================================

                const resCategorias =
                    await fetch('/api/categorias');


                if (!resCategorias.ok) {

                    throw new Error(
                        'No se pudieron obtener las categorías'
                    );

                }


                const categorias =
                    await resCategorias.json();


                // ==========================================
                // BUSCAR CATEGORÍA
                // ==========================================

                const categoriaEncontrada =
                    categorias.find(
                        c =>
                            c.nombre.toLowerCase() ===
                            categoria.toLowerCase() &&
                            c.tipo === 'GASTO'
                    );


                if (!categoriaEncontrada) {

                    console.error(
                        '❌ No se encontró la categoría:',
                        categoria
                    );

                    alert(
                        `No se encontró la categoría "${categoria}".`
                    );

                    return;
                }


                console.log(
                    "📂 CATEGORÍA SELECCIONADA:",
                    categoriaEncontrada
                );


                // ==========================================
                // GUARDAR LÍMITE
                // ==========================================

                const datosLimite = {

                    id_usuario:
                        usuario.id_usuario,

                    id_categoria:
                        categoriaEncontrada.id_categoria,

                    monto_limite:
                        monto,

                    periodo:
                        'MENSUAL'
                };


                console.log(
                    "📤 DATOS DEL LÍMITE:",
                    datosLimite
                );


                const res =
                    await fetch('/api/limites', {

                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                datosLimite
                            )
                    });


                const respuesta =
                    await res
                        .json()
                        .catch(() => ({}));


                console.log(
                    "📥 RESPUESTA DEL SERVIDOR:",
                    respuesta
                );


                if (!res.ok) {

                    console.error(
                        '❌ Error al guardar límite:',
                        respuesta
                    );

                    alert(
                        "No se pudo guardar el límite:\n" +
                        (
                            respuesta.error ||
                            "Error desconocido"
                        )
                    );

                    return;
                }


                console.log(
                    '✅ Límite guardado correctamente'
                );


                // ==========================================
                // CERRAR Y LIMPIAR
                // ==========================================

                modalNuevo.style.display =
                    'none';

                formNuevo.reset();


                // ==========================================
                // ACTUALIZAR ALERTAS
                // ==========================================

                await window.actualizarAlertas();


            } catch (error) {

                console.error(
                    '❌ Error al guardar límite:',
                    error
                );

                alert(
                    "Ocurrió un error al guardar el límite."
                );

            }

        };

    }


    // ==========================================
    // CARGAR ALERTAS AL INICIAR
    // ==========================================

    window.actualizarAlertas();

});

};