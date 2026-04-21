import { fetchJson, postJson } from "../api.js";

export function getSpellExplanation(index) {
    return fetchJson(`/spells/${index}/explanation`);
}

export function chatAboutSpell(index, messages) {
    return postJson(`/spells/${index}/chat`, messages);
}