import { getSpellByIndex } from "../services/spellService.js";
import { chatAboutSpell, getSpellExplanation } from "../services/aiSpellService.js";
import { renderThinkingMessage } from "../components/loadingDots.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export async function render(container, params) {
    const index = params.get("index");
    if (!index) return renderError(container, "Invalid spell index.");

    const spell = await getSpellByIndex(index);
    if (!spell) return renderError(container, "Spell not found.");

    console.log("Rendering spell:", spell);

    container.innerHTML = renderSpellHtml(spell);

    setupAiPanel(container, spell);
}

function renderSpellHtml(spell) {
    return `
        <div class="spell-page">
            <div class="spell-main">
                <div class="card spell-detail">
                    <h2><span>${spell.name}</span></h2>

                    <div class="spell-stat-block">
                        ${renderStatBlockItem("Level", spell.level === 0 ? "Cantrip" : spell.level)}
                        ${renderStatBlockItem("Casting Time", spell.casting_time)}
                        ${renderStatBlockItem("Range", spell.range)}
                        ${renderStatBlockItem("Components", spell.components?.join(", "))}
                        ${renderStatBlockItem("Duration", spell.duration)}
                        ${renderStatBlockItem("School", spell.school?.name)}
                        ${renderStatBlockItem("Ritual", spell.ritual ? "Yes" : "No")}
                        ${renderStatBlockItem("Concentration", spell.concentration ? "Yes" : "No")}
                        ${renderStatBlockItem("Attack Type", spell.attack_type)}
                    </div>
                    ${renderMaterial(spell.material)}

                    
                    <h3>Description</h3>
                    ${renderParagraphs(spell.desc)}
                    
                    ${spell.higher_level?.length
            ? `<h3>At Higher Levels</h3>${renderParagraphs(spell.higher_level)}`
            : ""}

                    ${renderDamage(spell.damage)}
                    ${renderDc(spell.dc)}
                    ${renderAoe(spell.area_of_effect)}
                    
                    <h3>Classes</h3>
                    <p>${spell.classes?.map(c => c.name).join(", ") || "None"}</p>

                    <button id="explain-btn" class="accent mt-4" aria-label="Explain this spell">Explain this spell</button>
                </div>

                <button id="ai-panel-btn" class="ai-button-position ai-spark" aria-label="Toggle AI Panel"></button>
            </div>

            <aside id="ai-sidepanel" class="ai-sidepanel">
                <div class="ai-sidepanel-header">
                    <h3>AI Insights</h3>
                </div>

                <div id="ai-thread" class="ai-thread"></div>

                <div class="ai-input-row">
                    <input id="ai-input" type="text" placeholder="Ask something…" />
                    <button id="ai-send-btn" aria-label="Send">Send</button>
                </div>
            </aside>
        </div>
    `;
}

function renderMaterial(material) {
    if (!material) return "";
    return `
        <p class="material">Material: ${material}</p>
    `;
}

function renderStatBlockItem(label, value) {
    if (!value) return "";
    return `
        <div class="spell-stat-block-item">
            <p class="label">${label}:</p>
            <p class="value">${value}</p>
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

    const md = arr.join("\n\n");
    const fixed = fixMarkdownTables(md);

    return marked.parse(fixed);
}

function fixMarkdownTables(md) {
    return md
        // Insert blank line after table rows
        .replaceAll(/(\|.*\|)\n(?!\|)/g, "$1\n\n")
        // Remove double blank lines inside tables
        .replaceAll(/\n\s*\n\|/g, "\n|")
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
    const explainBtn = container.querySelector("#explain-btn");
    const input = container.querySelector("#ai-input");
    const sendBtn = container.querySelector("#ai-send-btn");
    const thread = container.querySelector("#ai-thread");

    let history = [];

    function addMessage(role, content) {
        history.push({ role, content });

        const div = document.createElement("div");
        div.className = `ai-message ${role}`;
        div.innerHTML = marked.parse(content);
        thread.appendChild(div);

        thread.scrollTop = thread.scrollHeight;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text);
        input.value = "";

        setLoading(true);
        const thinking = showThinking();

        const response = await chatAboutSpell(spell.index, history);

        thinking.remove();
        setLoading(false);
        addMessage("assistant", response);
    }

    function showThinking() {
        const message = renderThinkingMessage("Thinking", "ai-message assistant thinking");
        thread.appendChild(message);
        thread.scrollTop = thread.scrollHeight;
        return message; // so we can remove it later
    }

    function setLoading(isLoading) {
        explainBtn.disabled = isLoading;
        sendBtn.disabled = isLoading;
        input.disabled = isLoading;
    }

    aiBtn.addEventListener("click", () => {
        aiPanel.classList.toggle("open");
    });

    explainBtn.addEventListener("click", async () => {
        aiPanel.classList.add("open");

        setLoading(true);
        const thinking = showThinking();

        const explanation = await getSpellExplanation(spell.index);

        thinking.remove();
        setLoading(false);
        addMessage("assistant", explanation);
    });

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
}

export default { render };
