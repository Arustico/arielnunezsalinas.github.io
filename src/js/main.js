// 1. Importación de estilos
import '../styles/main.scss';

// 2. Importación de Módulos
import * as config from '../config/constants.js';
import { initMenuHandler } from './menu-handler.js';
import { loadPartials } from './partials-loader.js'; // carpeta partials


// 3. Inicialización
const base = config.base;
//console.log('URL:', import.meta.env.VITE_FORM_URL); // agrega esto temporalmente
//console.log('URL:', import.meta.env.VITE_FORM_TOKEN); // agrega esto temporalmente


document.addEventListener('DOMContentLoaded', async () => {
    //Primero Partials para que puedan ser manipulados
    await loadPartials();

    // Título y descripción (HEAD)
    const page = document.body.dataset.page;
    const titles = {
        home:     config.site_title_home,
        project1: config.site_title_project1,
        project2: config.site_title_project2,
        project3: config.site_title_project3,
    };
    document.title = titles[page] || config.site_title_home;
    document.querySelector('meta[name="description"]')
    ?.setAttribute('content', config.site_description);

    // Nombre usuario principal
    document.querySelectorAll('.js-user-name').forEach(el =>{
        el.textContent = config.main_name
    })

    // Nombres de variables para encabezados y sus referencias
    const navMap = {
        'js-nav-main':     { text: config.header_main_page,    href: `${base}/` },
        'js-nav-projects': { text: config.header_project_name, href: `${base}/#projects` },
        'js-nav-about':    { text: config.header_about_name,   href: `${base}/#about` },
        'js-nav-contact':  { text: config.header_contact_name, href: `${base}/#contact` },
    };

    Object.entries(navMap).forEach(([className, { text, href }]) => {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.textContent = text;
            el.setAttribute('href', href);
        });
    });

    // Links para información de contacto
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
                    body: JSON.stringify(data),
                    //headers: { 'Content-Type': 'application/json' }, // No necesario para google script

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
