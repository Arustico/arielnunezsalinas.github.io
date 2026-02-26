
const base = import.meta.env.BASE_URL; // para que automáticamente identifique en desarrollo y producción

async function loadPartial(id, path) {
    const res  = await fetch(`${base}${path}`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

export async function loadPartials() {
    await Promise.all([
        loadPartial('header-placeholder', 'partials/header.html'),
        loadPartial('footer-placeholder', 'partials/footer.html'),
    ]);
}
