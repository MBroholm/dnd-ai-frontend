import { fetchJson } from "../api.js";

export function getSpellList() {
    return fetchJson("/spells");
}

export function getSpellByIndex(index) {
    return fetchJson(`/spells/${index}`);
}