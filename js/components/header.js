export function renderHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
    <div class="header-container">
        <h1 class="logo"><a href="#/">AI Spell Book</a></h1>
        <nav class="site-nav">
            <a href="#/">Home</a>
            <a href="#/spells" data-link>Spells</a>
        </nav>
    </div>
    `;
    
    return header;
}