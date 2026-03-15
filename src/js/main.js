// 1. Importación de estilos
import '../styles/main.scss';

// 2. Importación de Módulos
import * as config from '../config/constants.js';
import { initMenuHandler } from './menu-handler.js';
import { loadPartials } from './partials-loader.js'; // carpeta partials
import { initPlotlyFigures } from './plot_loader.js';

// 3. Inicialización
const base = config.base;

document.addEventListener('DOMContentLoaded', async () => {
    await loadPartials();

    // Detectar idioma guardado
    const savedLang = localStorage.getItem('lang') || 'es';
    applyLanguage(savedLang);

    // Botón toggle idioma
    const langBtn = document.getElementById('lang-toggle');
    const langBtnMobile = document.getElementById('lang-toggle-mobile');

    function toggleLang() {
        const current = localStorage.getItem('lang') || 'es';
        const next = current === 'es' ? 'en' : 'es';
        localStorage.setItem('lang', next);
        applyLanguage(next);
    }

    if (langBtn) langBtn.addEventListener('click', toggleLang);
    if (langBtnMobile) langBtnMobile.addEventListener('click', toggleLang);

    // Formulario de contacto
    const form = document.querySelector('.contact__form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // selección del lenguaje
            const t = config.translations[localStorage.getItem('lang') || 'es'];
            // tokens del formulario
            const data = {
                token:    import.meta.env.VITE_FORM_TOKEN,
                honeypot: form.honeypot.value,
                nombre:   form.nombre.value,
                email:    form.email.value,
                mensaje:  form.mensaje.value,
            };
            try {
                await fetch(import.meta.env.VITE_FORM_URL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
                alert(t.form_success);
                form.reset();
            } catch (err) {
                alert(t.form_error);
            }
        });
    }

    // figuras de plotly
    initPlotlyFigures();

    // Handlers
    initMenuHandler();
});

function applyLanguage(lang) {
    const t = lang === 'en' ? config.en : config.es;
    const page = document.body.dataset.page;

    // Título de página
    const titles = {
        home:     t.site_title_home,
        project1: t.site_title_project1,
        project2: t.site_title_project2,
        project3: t.site_title_project3,
    };
    document.title = titles[page] || t.site_title_home;
    document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.site_description);

    // Nombre usuario
    document.querySelectorAll('.js-user-name').forEach(el => {
        el.textContent = t.main_name;
    });

    // Navegación
    const navMap = {
        'js-nav-main':     { text: t.header_main_page,    href: `${base}/` },
        'js-nav-projects': { text: t.header_project_name, href: `${base}/#projects` },
        'js-nav-about':    { text: t.header_about_name,   href: `${base}/#about` },
        'js-nav-contact':  { text: t.header_contact_name, href: `${base}/#contact` },
    };
    Object.entries(navMap).forEach(([className, { text, href }]) => {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.textContent = text;
            el.setAttribute('href', href);
        });
    });

    // Links sociales
    const linkMap = {
        'js-link-github':     config.link_github,
        'js-link-linkedin':   config.link_linkedin,
        'js-link-curriculum': config.link_curriculum,
    };
    Object.entries(linkMap).forEach(([className, href]) => {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.setAttribute('href', href);
        });
    });

    // Botón hero
    const btnProjects = document.querySelector('.home-hero__cta a');
    if (btnProjects) {
        btnProjects.textContent = t.header_project_name;
        btnProjects.setAttribute('href', `${base}/#projects`);
    }

    // Textos con data-i18n
    applyTranslations(lang);

    // Label del botón toggle
    const langBtn = document.getElementById('lang-toggle');
    const langBtnMobile = document.getElementById('lang-toggle-mobile')
    // Actualiza ambos botones
    if (langBtn) langBtn.textContent = lang === 'es' ? 'EN' : 'ES';
    if (langBtnMobile) langBtnMobile.textContent = lang === 'es' ? 'EN' : 'ES';

}

function applyTranslations(lang) {
    const t = config.translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.setAttribute('placeholder', t[key]);
        });
}
