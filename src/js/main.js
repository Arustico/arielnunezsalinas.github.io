//1. Importación de estilos
import '../styles/main.scss';

//2. Importación de Módulos
import * as config from '../config/constants.js';
import { initMenuHandler } from './menu-handler.js';


//3. Inicialización
document.querySelector("#main_name").textContent = config.main_name;
document.querySelector("#header_main_page").textContent = config.header_main_page;
document.querySelector("#header_contact_name").textContent = config.header_contact_name;
document.querySelector("#header_about_name").textContent = config.header_about_name;
document.querySelector("#header_project_name").textContent = config.header_project_name;

// Inicialización de handlers
initMenuHandler();
