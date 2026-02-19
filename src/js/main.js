//1. Importación de estilos
import '../styles/main.scss';

//2. Importación de Módulos
import * as config from '../config/constants.js';
import { initMenuHandler } from './menu-handler.js';

const base = config.base;

//3. Inicialización
document.querySelectorAll(".js-main-name").forEach(el => {
    if (el) el.textContent = config.main_name;
});

document.querySelector("#header_main_page").textContent = config.header_main_page;
document.querySelector("#header_main_page").setAttribute('href', `${base}/`);

document.querySelector("#header_project_name").textContent = config.header_project_name;
document.querySelector("#header_project_name").setAttribute('href', `${base}/#projects`);

document.querySelector("#header_about_name").textContent = config.header_about_name;
document.querySelector("#header_about_name").setAttribute('href', `${base}/#about`);

document.querySelector("#header_contact_name").textContent = config.header_contact_name;
document.querySelector("#header_contact_name").setAttribute('href', `${base}/#contact`);

// Para Mobile
const mobileLinks = document.querySelectorAll('.header__sm-menu-link a');
const mobilePaths = [`${base}/`, `${base}/#about`, `${base}/#projects`, `${base}/#contact`];
const mobileMenu = {
    '.js-mobile-main':    { text: config.header_main_page,    href: `${base}/` },
    '.js-mobile-about':   { text: config.header_about_name,   href: `${base}/#about` },
    '.js-mobile-projects':{ text: config.header_project_name, href: `${base}/#projects` },
    '.js-mobile-contact': { text: config.header_contact_name, href: `${base}/#contact` },
};

const navLinks = {
    header_main_page: `${base}/`,
    header_project_name: `${base}/#projects`,
    header_about_name: `${base}/#about`,
    header_contact_name: `${base}/#contact`,
};

Object.entries(navLinks).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', href);
});

// Inicialización de handlers

mobileLinks.forEach((link, index) => {
    link.setAttribute('href', mobilePaths[index]);
});

Object.entries(mobileMenu).forEach(([selector, { text, href }]) => {
    const el = document.querySelector(selector);
    if (el) {
        el.textContent = text;
        el.setAttribute('href', href);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initMenuHandler()
});


