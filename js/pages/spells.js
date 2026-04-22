import { getSpellList } from "../services/spellService.js";

export async function render(container, params) {
    container.innerHTML = `
        <h2>Spells</h2>

        <div class="spell-filters">
            <input id="filter-name" type="text" placeholder="Search by name…" />
            <select id="filter-level">
                <option value="">All Levels</option>
                <option value="0">Cantrip</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
                <option value="8">Level 8</option>
                <option value="9">Level 9</option>
            </select>
        </div>

        <div id="spell-list-container">Loading spells...</div>
    `;

    const spellListContainer = container.querySelector("#spell-list-container");
    const spells = await getSpellList();
    let filtered = spells;

    const filterName = container.querySelector("#filter-name");
    const filterLevel = container.querySelector("#filter-level");

    filterName.addEventListener("input", applyFilters);
    filterLevel.addEventListener("change", applyFilters);

    function applyFilters() {
        const nameValue = filterName.value.toLowerCase();
        const levelValue = filterLevel.value;

        filtered = spells.filter(spell => {
            const matchesName = spell.name.toLowerCase().includes(nameValue);
            const matchesLevel = levelValue === "" || spell.level == levelValue;
            return matchesName && matchesLevel;
        });

        renderSpellList(filtered);
    }

    renderSpellList(spells);
}

function renderSpellList(spells) {
    const container = document.querySelector("#spell-list-container");
    container.replaceChildren();

    if (spells.length === 0) {
        container.innerHTML = "<p>No spells found.</p>";
        return;
    }

    spells.forEach(spell => {
        container.appendChild(renderSpellListItem(spell));
    });
}

function renderSpellListItem(spell) {
    const item = document.createElement('div');
    item.className = 'card card--clickable spell-list-item';

    item.innerHTML = `
        <h3>${spell.name}</h3>
        <p> ${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</p>
    `;

    item.addEventListener('click', () => {
        window.location.hash = `#/spell?index=${spell.index}`;
    });

    return item;
}

export default { render };