import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";

const routes = {
    '/': { module: './pages/home.js' },
    '/spells': { module: './pages/spells.js' },
    '/spell': { module: './pages/spell.js' }
};

async function handleRoute() {
    const hash = window.location.hash || '#/';
    const [path, queryString] = hash.slice(1).split('?');
    const params = new URLSearchParams(queryString);

    const route = routes[path] || routes['/'];

    renderLayout();

    try {
        const { default: page } = await import(route.module);
        const content = document.getElementById('content');
        content.innerHTML = '';
        await page.render(content, params);
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content').innerHTML = '<p>Error loading page.</p>';
    }
}

function renderLayout() {
    const headerRoot = document.getElementById('header-root');
    const footerRoot = document.getElementById('footer-root');

    headerRoot.innerHTML = '';
    footerRoot.innerHTML = '';

    headerRoot.appendChild(renderHeader());
    footerRoot.appendChild(renderFooter());
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);

export function navigate(path) {
    window.location.hash = path;
}