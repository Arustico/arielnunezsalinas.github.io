export async function loadDiagram(diagramPath) {
    try {
        const response = await fetch(diagramPath);
        const diagramData = await response.json();
        return diagramData;
    } catch (error) {
        console.error('Error cargando diagrama:', error);
        return null;
    }
}

export function renderDiagram(container, diagramData) {
    // Implementa la lógica específica para renderizar isoflow
    // (dependerá de la librería que uses para isoflow)
    console.log('Renderizando diagrama:', diagramData);
}
