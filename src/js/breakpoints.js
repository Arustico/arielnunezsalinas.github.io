// src/js/breakpoints.js
// ─────────────────────────────────────────────────────────────────
// Lee los breakpoints definidos en _mixins.scss desde las CSS
// custom properties del :root. Fuente única de verdad para todo el proyecto.
// ─────────────────────────────────────────────────────────────────

/**
 * Lee un breakpoint definido en :root como --bp-{name}.
 * Devuelve el valor en px como número entero.
 *
 * @param {string} name - Nombre del breakpoint ('phone', 'tab-port', etc.)
 * @returns {number} Valor en px sin unidad.
 */

export function getBreakpoint(name) {
    const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--bp-${name}`)
    .trim(); // → "768px"

    const value = parseInt(raw, 10);

    if (isNaN(value)) {
        console.warn(`[breakpoints] No se encontró --bp-${name} en :root`);
        return 0;
    }

    return value;
};

/**
 * Objeto con todos los breakpoints disponibles.
 * Se evalúa una vez al importar el módulo.
 * Uso: import { bp } from './breakpoints.js'
 *      if (window.innerWidth < bp.tabPort) { ... }
 */
export const bp = {
    phone:      getBreakpoint('phone'),       // 480
    tabPort:    getBreakpoint('tab-port'),     // 768
    tabLand:    getBreakpoint('tab-land'),     // 1024
    bigDesktop: getBreakpoint('big-desktop'),  // 1200
};
