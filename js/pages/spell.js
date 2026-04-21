import { getSpellByIndex } from "../services/spellService.js";
import { getSpellExplanation } from "../services/aiSpellService.js";

export async function render(container, params) {
    const index = params.get("index");
    if (!index) return renderError(container, "Invalid spell index.");

    const spell = await getSpellByIndex(index);
    if (!spell) return renderError(container, "Spell not found.");

    container.innerHTML = renderSpellHtml(spell);

    setupAiPanel(container, spell);
}

function renderSpellHtml(spell) {
    return `
        <div class="spell-page">
            <div class="spell-main">
                <div class="card spell-detail">
                    <h2>${spell.name}</h2>
                    <p class="text-muted">
                        ${spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} •
                        ${spell.school?.name ?? ""}
                    </p>

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
                    ${renderParagraphs(spell.desc)}

                    ${spell.higher_level?.length
                        ? `<h3>At Higher Levels</h3>${renderParagraphs(spell.higher_level)}`
                        : ""}

                    <h3>Classes</h3>
                    <p>${spell.classes?.map(c => c.name).join(", ") || "None"}</p>

                    <button id="explain-btn" class="accent mt-4">Explain this spell</button>
                </div>

                <button id="ai-panel-btn" class="ai-button-position ai-spark"></button>
            </div>

            <aside id="ai-sidepanel" class="ai-sidepanel">
                <div class="ai-sidepanel-header">
                    <h3>AI Insights</h3>
                </div>
                <div id="ai-content" class="ai-content">
                    <p>Click “Explain” to generate insights.</p>
                </div>
            </aside>
        </div>
    `;
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

function renderError(container, message) {
    container.innerHTML = `<p>${message}</p>`;
}

function renderParagraphs(arr) {
    if (!arr?.length) return "<p>No description available.</p>";
    return `<div>${arr.map(p => `<p>${p}</p>`).join("")}</div>`;
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


function setupAiPanel(container, spell) {
    const aiBtn = container.querySelector("#ai-panel-btn");
    const aiPanel = container.querySelector("#ai-sidepanel");
    const aiContent = container.querySelector("#ai-content");
    const explainBtn = container.querySelector("#explain-btn");

    aiBtn.addEventListener("click", () => {
        aiPanel.classList.toggle("open");
    });

    explainBtn.addEventListener("click", async () => {
        aiPanel.classList.add("open");
        aiContent.innerHTML = "<p>Generating explanation...</p>";

        const explanation = await getSpellExplanation(spell.index);
        const html = marked.parse(explanation);

        aiContent.innerHTML = `
            <div class="card mt-4">
                <div class="spell-explanation">${html}</div>
            </div>
        `;
    });
}

export default { render };
