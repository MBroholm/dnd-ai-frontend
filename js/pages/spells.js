import { getSpellList } from "../services/spellService.js";
import { renderThinkingMessage } from "../components/loadingDots.js";
import { getClassList } from "../services/classService.js";

export async function render(container, params) {
    container.innerHTML = `
        <h2>Spells</h2>

        <div class="spell-filters">
            <input id="filter-name" type="text" placeholder="Search by name…" />
            <select id="filter-level" aria-label="Filter by spell level">
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
            <select id="filter-class" aria-label="Filter by class">
                <option value="">All Classes</option>
            </select>
        </div>

        <div id="spell-list-container"></div>
    `;

    const spellListContainer = document.getElementById("spell-list-container");
    spellListContainer.appendChild(renderThinkingMessage("Loading spells"));

    const spells = await getSpellList();
    spells.sort((a, b) => a.name.localeCompare(b.name));
    let filtered = spells;

    renderSpellList(spells);

    const filterName = container.querySelector("#filter-name");
    const filterLevel = container.querySelector("#filter-level");
    const filterClass = container.querySelector("#filter-class");
    populateClassFilter(filterClass);

    filterName.addEventListener("input", applyFilters);
    filterLevel.addEventListener("change", applyFilters);
    filterClass.addEventListener("change", applyFilters);

    function applyFilters() {
        const nameValue = filterName.value.toLowerCase();
        const levelValue = filterLevel.value;
        const classValue = filterClass.value;

        filtered = spells.filter(spell => {
            const matchesName = spell.name.toLowerCase().includes(nameValue);
            const matchesLevel = levelValue === "" || spell.level == levelValue;
            const matchesClass = classValue === "" || spell.classes?.map(c => c.index).includes(classValue);
            return matchesName && matchesLevel && matchesClass;
        });

        renderSpellList(filtered);
    }

}

async function populateClassFilter(selectElement) {
    const classes = await getClassList();

    classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.index;
        option.textContent = cls.name;
        selectElement.appendChild(option);
    });
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