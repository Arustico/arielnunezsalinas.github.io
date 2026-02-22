// 1. Importación de estilos
import '../styles/main.scss';

// 2. Importación de Módulos
import * as config from '../config/constants.js';
import { initMenuHandler } from './menu-handler.js';

// 3. Inicialización
const base = config.base;
//console.log('URL:', import.meta.env.VITE_FORM_URL); // agrega esto temporalmente
//console.log('URL:', import.meta.env.VITE_FORM_TOKEN); // agrega esto temporalmente


document.addEventListener('DOMContentLoaded', () => {

    // Nombre dinámico
    document.querySelectorAll('.js-main-name').forEach(el => {
        el.textContent = config.main_name;
    });

    // Links desktop
    const desktopLinks = {
        header_main_page:    { text: config.header_main_page,    href: `${base}/` },
        header_project_name: { text: config.header_project_name, href: `${base}/#projects` },
        header_about_name:   { text: config.header_about_name,   href: `${base}/#about` },
        header_contact_name: { text: config.header_contact_name, href: `${base}/#contact` },
    };

    Object.entries(desktopLinks).forEach(([id, { text, href }]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
            el.setAttribute('href', href);
        }
    });

    // Links mobile
    const mobileMenu = {
        '.js-mobile-main':     { text: config.header_main_page,    href: `${base}/` },
        '.js-mobile-about':    { text: config.header_about_name,   href: `${base}/#about` },
        '.js-mobile-projects': { text: config.header_project_name, href: `${base}/#projects` },
        '.js-mobile-contact':  { text: config.header_contact_name, href: `${base}/#contact` },
    };

    Object.entries(mobileMenu).forEach(([selector, { text, href }]) => {
        const el = document.querySelector(selector);
        if (el) {
            el.textContent = text;
            el.setAttribute('href', href);
        }
    });

    // Botón hero
    const btnProjects = document.querySelector('.home-hero__cta a');
    if (btnProjects) {
        btnProjects.textContent = config.header_project_name;
        btnProjects.setAttribute('href', `${base}/#projects`);
    }

    // Formulario de contacto
    const form = document.querySelector('.contact__form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                alert('¡Mensaje enviado!');
                form.reset();
            } catch (err) {
                alert('Error al enviar. Intenta nuevamente.');
            }
        });
    }

    // Handlers
    initMenuHandler();
});
