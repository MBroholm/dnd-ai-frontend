import { getSpellByIndex } from "../services/spellService.js";
import { getSpellExplanation } from "../services/aiSpellService.js";

export async function render(container, params) {
    const index = params.get("index");
    if (!index) {
        container.innerHTML = "<p>Invalid spell index.</p>";
        return;
    }

    const spell = await getSpellByIndex(index);
    if (!spell) {
        container.innerHTML = "<p>Spell not found.</p>";
        return;
    }

    container.innerHTML = `
        <div class="card spell-detail">
            <h2>${spell.name}</h2>
            <p class="text-muted"> ${spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} • ${spell.school?.name ?? ""}</p>

            <div class="spell-meta">
                ${renderMetaRow("Casting Time", spell.casting_time)}
                ${renderMetaRow("Range", spell.range)}
                ${renderMetaRow("Components", spell.components?.join(", "))}
                ${renderMetaRow("Duration", spell.duration)}
                ${renderMetaRow("Material", spell.material)}
                ${renderMetaRow("Ritual", spell.ritual ? "Yes" : "No")}
                ${renderMetaRow("Concentration", spell.concentration ? "Yes" : "No")}
                ${renderMetaRow("Attack Type", spell.attack_type)}
            </div>

            ${renderDamage(spell.damage)}
            ${renderDc(spell.dc)}
            ${renderAoe(spell.area_of_effect)}
            
            <h3>Description</h3>
            <div class="spell-description">
                ${spell.desc?.map(p => `<p>${p}</p>`).join("") ?? "<p>No description available.</p>"}
            </div>


            ${spell.higher_level?.length
            ? `<h3>At Higher Levels</h3>
                <div class="spell-higher-level">
                    ${spell.higher_level.map(p => `<p>${p}</p>`).join("")}
                </div>`
            : ""}

            <h3>Classes</h3>
            <p>${spell.classes?.map(c => c.name).join(", ") || "None"}</p>

            <button id="explain-btn" class="accent mt-4">Explain this spell</button>
            <div id="explain-output" class="mt-4"></div>
        </div>
    `;

    const explainBtn = container.querySelector("#explain-btn");
    const explainOutput = container.querySelector("#explain-output");

    explainBtn.addEventListener("click", async () => {
        explainOutput.innerHTML = "<p>Generating explanation...</p>";

        const explanation = await getSpellExplanation(spell.index);
        const html = marked.parse(explanation);

        explainOutput.innerHTML = `
            <div class="card mt-4">
                <div class="spell-explanation">
                    ${html}
                </div>
            </div>
        `;
    });
}

function renderMetaRow(label, value) {
    if (!value) return "";
    return `
        <div class="spell-meta-row">
            <span class="label">${label}:</span>
            <span>${value}</span>
        </div>
    `;
}

function renderDamage(damage) {
    if (!damage) return "";

    const type = damage.damage_type?.name ?? "Unknown";
    const slotScaling = damage.damage_at_slot_level
        ? Object.entries(damage.damage_at_slot_level)
            .map(([lvl, dmg]) => `<li>Level ${lvl}: ${dmg}</li>`)
            .join("")
        : null;

    const levelScaling = damage.damage_at_character_level
        ? Object.entries(damage.damage_at_character_level)
            .map(([lvl, dmg]) => `<li>Level ${lvl}: ${dmg}</li>`)
            .join("")
        : null;

    return `
        <h3>Damage</h3>
        <p><strong>Type:</strong> ${type}</p>

        ${slotScaling ? `<p><strong>Damage at Slot Level:</strong></p><ul>${slotScaling}</ul>` : ""}
        ${levelScaling ? `<p><strong>Damage at Character Level:</strong></p><ul>${levelScaling}</ul>` : ""}
    `;
}

function renderDc(dc) {
    if (!dc) return "";
    return `
        <h3>Saving Throw</h3>
        <p><strong>Type:</strong> ${dc.dc_type?.name ?? "Unknown"}</p>
        <p><strong>Success:</strong> ${dc.dc_success ?? "None"}</p>
        ${dc.desc ? `<p>${dc.desc}</p>` : ""}
    `;
}

function renderAoe(aoe) {
    if (!aoe) return "";
    return `
        <h3>Area of Effect</h3>
        <p><strong>Type:</strong> ${aoe.type}</p>
        <p><strong>Size:</strong> ${aoe.size} ft</p>
    `;
}

export default { render };
