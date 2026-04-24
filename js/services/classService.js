import { fetchJson } from "../api.js";

export function getClassList() {
    return fetchJson("/classes");
}