import { getSpellList } from "../services/spellService.js";

export async function render(container, params) {
    container.innerHTML = `
        <h2>Spells</h2>
        <div id="spell-list-container">Loading spells...</div>
    `;

    const spellListContainer = container.querySelector("#spell-list-container");
    const spells = await getSpellList();

    console.log("Fetched spells:", spells);
    
    if (spells.length === 0) {
        spellListContainer.innerHTML = "<p>No spells found.</p>";
        return;
    }

    spellListContainer.replaceChildren(); // Clear loading text
    spells.forEach(spell => {
        spellListContainer.appendChild(renderSpellListItem(spell));
    });
}

function renderSpellListItem(spell) {
    const item = document.createElement('div');
    item.className = 'card card--clickable spell-list-item';

    item.innerHTML = `
        <h3>${spell.name}</h3>
        <p> ${spell.level===0 ? 'Cantrip' : `Level ${spell.level}`}</p>
    `;

    item.addEventListener('click', () => {
        window.location.hash = `#/spell?index=${spell.index}`;
    });

    return item;
}

export default { render };