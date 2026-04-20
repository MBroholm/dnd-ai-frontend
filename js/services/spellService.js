import { fetchJson } from "../api.js";

export async function getSpellList() {
    const spellList = await fetchJson("/spells");
    return spellList.results;
}

export function getSpellByIndex(index) {
    return fetchJson(`/spells/${index}`);
}