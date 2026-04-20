import { fetchJson } from "../api.js";

export function getSpellExplanation(index) {
    return fetchJson(`/spells/${index}/explanation`);
}