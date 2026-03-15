
/**
 * plotly-loader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo reutilizable para cargar y renderizar figuras Plotly desde archivos
 * JSON exportados con fig.write_json().
 *
 * Características:
 *   - Carga lazy (IntersectionObserver): el JSON se descarga solo cuando el
 *     contenedor entra al viewport, ahorrando ancho de banda.
 *   - Skeleton animado mientras carga.
 *   - Ajustes responsivos automáticos para móvil (menor a 768 px).
 *   - Manejo de errores con mensaje visible al usuario.
 *   - Re-renderizado en resize con debounce para no saturar el hilo principal.
 *   - Admite múltiples figuras en la misma página sin conflictos.
 */


const BASE_URL = import.meta.env.BASE_URL;
import Plotly from 'plotly.js-dist-min';
import { bp } from './breakpoints.js';

// ─────────────────────────────────────────────
// Constantes de configuración
// ─────────────────────────────────────────────
const isMobile  = () => window.innerWidth <  bp.tabPort;  // < 768
const isTablet  = () => window.innerWidth <  bp.tabLand;  // < 1024
const isDesktop = () => window.innerWidth >= bp.tabLand;  // ≥ 1024

/** Milisegundos de espera antes de re-renderizar en resize. */
const RESIZE_DEBOUNCE_MS = 250;

/** Opciones globales de Plotly (se pueden sobreescribir por figura). */
const DEFAULT_PLOTLY_CONFIG = {
    responsive: true,
    displayModeBar: true,        // barra de herramientas de Plotly
    displaylogo: false,           // oculta el logo de Plotly
    modeBarButtonsToRemove: [    // botones innecesarios para el usuario final
    'sendDataToCloud',
    'lasso2d',
    'select2d',
    ],
    scrollZoom: false,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
/**
 * Aplica ajustes de layout específicos para móvil.
 *
 * QUÉ toca y por qué:
 *   - font.size    → etiquetas legibles en pantalla pequeña.
 *   - geo.domain   → restringe el mapa verticalmente para dejar espacio
 *                    a los controles (slider + botones) sin superponerse.
 *   - colorbar     → más delgada y con fuente menor para no tapar el mapa.
 *
 * QUÉ NO toca:
 *   - margin       → definido en Python con el espacio exacto para controles.
 *   - height       → ídem; cambiarlo aquí desajustaría el layout de botones.
 *   - sliders / updatemenus → Plotly.js los posiciona en coordenadas de papel;
 *                             no requieren ajuste JS adicional.
 *
 * @param {object} layout - Layout del JSON (se muta directamente).
 * @returns {object} El mismo layout modificado.
 */
function applyResponsiveLayout(layout) {
    // Fondo transparente siempre (integración con CSS de la página)
    layout.paper_bgcolor = 'rgba(0,0,0,0)';
    layout.plot_bgcolor  = 'rgba(0,0,0,0)';
    layout.autosize      = true;

    if (isMobile()) {
        // ── Fuente ──────────────────────────────────────────────────────────────
        layout.font = { ...(layout.font ?? {}), size: 10 };

        // ── Mapa geo: restringe el alto para no solaparse con los controles ──────
        // geo.domain.y define qué fracción vertical del "paper" ocupa el mapa.
        // [0.15, 1] → el mapa empieza al 15% del alto (deja espacio abajo para
        // slider/botones) y llega hasta arriba.
        if (layout.geo) {
            layout.geo.domain = { x: [0, 1], y: [0.15, 1] };
        }

        // ── Colorbar: más compacta en móvil ─────────────────────────────────────
        // Recorremos todas las trazas del primer frame para ajustar la colorbar.
        // No podemos tocar fig.data directamente desde applyResponsiveLayout
        // porque esta función solo recibe el layout; el ajuste de trazas se hace
        // en renderFigure() después de llamar a esta función.
    }

    return layout;
}


/**
 * Ajusta la colorbar de las trazas para móvil.
 * Se llama por separado porque applyResponsiveLayout solo recibe el layout.
 *
 * @param {object[]} traces - Array fig.data del JSON.
 * @returns {object[]} Las mismas trazas modificadas.
 */
function applyResponsiveTraces(traces) {
    if (!isMobile()) return traces;

    return traces.map(trace => {
        if (trace.colorbar) {
            trace.colorbar = {
                ...trace.colorbar,
                thickness: 10,        // barra más delgada
                len: 0.6,             // más corta verticalmente
                title: {
                    ...(trace.colorbar.title ?? {}),
                      font: { size: 9 },
                },
                tickfont: { size: 8 },
            };
        }
        return trace;
    });
}


/**
 * Skeleton de carga animado.
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function attachSkeleton(container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'plotly-skeleton';
    skeleton.setAttribute('aria-label', 'Cargando gráfico…');
    skeleton.setAttribute('role', 'status');
    container.appendChild(skeleton);
    return skeleton;
}


/**
 * Mensaje de error visible al usuario.
 * @param {HTMLElement} container
 * @param {string}      message
 * @param {Error}       error
 */
function showError(container, message, error) {
    console.error('[plot_loader]', message, error);
    container.innerHTML = `
    <div class="plotly-error" role="alert">
    <span class="plotly-error__icon">⚠</span>
    <p class="plotly-error__message">${message}</p>
    </div>`;
}


/**
 * Descarga y valida el JSON de la figura.
 * @param {string} url
 * @returns {Promise<{data: object[], layout: object, frames?: object[]}>}
 */
async function fetchFigureJson(url) {

    const fullUrl = `${BASE_URL}${url.replace(/^\//, '')}`.replace(/\/\//g, '/');
    console.log('[plot_loader] Fetching:', fullUrl);
    const response = await fetch(fullUrl);

    if (!response.ok) throw new Error(`HTTP ${response.status} al obtener ${fullUrl}`);

    const text = await response.text();          // ← agrega esto
    console.log('[plot_loader] Primeros 200 chars:', text.slice(0, 200)); // ← y esto

    const fig = JSON.parse(text);

    //const fig = await response.json();

    if (!Array.isArray(fig.data) || typeof fig.layout !== 'object') {
        throw new Error(`JSON de ${url} no tiene estructura válida de Plotly.`);
    }

    return fig;
}


// ─────────────────────────────────────────────
// Renderizado principal
// ─────────────────────────────────────────────

/**
 * Descarga el JSON y renderiza la figura en el contenedor.
 *
 * Por qué usamos newPlot() en lugar de react() para la carga inicial:
 *   - newPlot() registra correctamente los frames de animación en la
 *     instancia interna de Plotly. react() no lo hace: ignora fig.frames,
 *     lo que deja la figura estática aunque el JSON los contenga.
 *
 * Por qué usamos react() en re-renders (resize):
 *   - Es más eficiente (diff en lugar de destruir y recrear).
 *   - Conserva el año activo en el slider.
 *   - En re-renders solo actualizamos layout/trazas, no los frames
 *     (que ya están registrados desde el newPlot inicial).
 *
 * @param {HTMLElement} container
 * @param {string}      jsonUrl
 * @param {boolean}     [isUpdate=false]
 */
async function renderFigure(container, jsonUrl, isUpdate = false) {
    let skeleton = null;
    if (!isUpdate) skeleton = attachSkeleton(container);

    try {
        const fig = await fetchFigureJson(jsonUrl);

        const layout = applyResponsiveLayout(fig.layout);
        const traces = applyResponsiveTraces(fig.data);

        if (isUpdate) {
            // Re-render por resize: solo actualizamos layout y trazas.
            // Los frames ya están registrados en la instancia de Plotly.
            await Plotly.react(container, traces, layout, DEFAULT_PLOTLY_CONFIG);
        } else {
            skeleton?.remove();
            // Primera carga: newPlot registra los frames correctamente.
            // fig.frames puede ser undefined si la figura no tiene animación;
            // Plotly lo maneja sin error.
            await Plotly.newPlot(container, traces, layout, DEFAULT_PLOTLY_CONFIG);

            // Registrar frames de animación si existen.
            // addFrames() debe llamarse DESPUÉS de newPlot().
            if (Array.isArray(fig.frames) && fig.frames.length > 0) {
                await Plotly.addFrames(container, fig.frames);
            }
        }

        container.dataset.loaded  = 'true';
        container.dataset.jsonUrl = jsonUrl;

    } catch (error) {
        skeleton?.remove();
        showError(container, 'No se pudo cargar el gráfico. Intenta recargar la página.', error);
    }
}


// ─────────────────────────────────────────────
// Resize con debounce
// ─────────────────────────────────────────────

let resizeTimer = null;

function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.querySelectorAll('.plotly-figure[data-loaded="true"]').forEach(container => {
            const url = container.dataset.jsonUrl;
            if (url) renderFigure(container, url, true);
        });
    }, RESIZE_DEBOUNCE_MS);
}

window.addEventListener('resize', handleResize);


// ─────────────────────────────────────────────
// IntersectionObserver — carga lazy
// ─────────────────────────────────────────────

const figureObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const container = entry.target;
        const jsonUrl   = container.dataset.json;

        if (!jsonUrl) {
            console.warn('[plot_loader] Contenedor sin atributo data-json:', container);
            return;
        }

        // Desconectar antes de renderizar: garantiza carga única aunque el
        // elemento salga y vuelva a entrar al viewport.
        observer.unobserve(container);
        renderFigure(container, jsonUrl);
    });
}, {
    rootMargin: '200px',  // pre-fetch anticipado
    threshold: 0,
});


// ─────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────

/**
 * Registra todos los contenedores `.plotly-figure` para carga lazy.
 * Llamar una vez cuando el DOM esté listo.
 *
 * @param {string} [selector='.plotly-figure']
 */
export function initPlotlyFigures(selector = '.plotly-figure') {
    const containers = document.querySelectorAll(selector);

    if (containers.length === 0) {
        console.warn('[plot_loader] No se encontraron contenedores con selector:', selector);
        return;
    }

    containers.forEach(container => {
        if (!container.style.minHeight) container.style.minHeight = '300px';
        figureObserver.observe(container);
    });

    console.info(`[plot_loader] ${containers.length} figura(s) registradas para carga lazy.`);
}




