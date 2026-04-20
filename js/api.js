const isLocalhost =
    globalThis.location.hostname === "localhost" ||
    globalThis.location.hostname === "127.0.0.1";

const BASE_URL = isLocalhost ? "http://localhost:8080" : "";

function buildHeaders(options, useAuth) {
    const headers = { ...options.headers };

    if (useAuth) {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

async function buildErrorMessage(response) {
    let errorMessage = `Error ${response.status}`;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
        const error = await response.json().catch(() => null);
        if (!error) return errorMessage;
        return error.message ?? JSON.stringify(error);
    }

    const text = await response.text().catch(() => "");
    return text || errorMessage;
}

async function parseResponseBody(response) {
    if (response.status === 204) return null;

    const contentType = response.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
        return await response.text() || null;
    }

    try {
        return await response.json();
    } catch (err) {
        throw new Error(`Invalid JSON: ${err.message}`);
    }
}

async function request(endpoint, options = {}, useAuth = false) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = buildHeaders(options, useAuth);

    const fetchOptions = {
        ...options,
        headers
    };

    let response;
    try {
        response = await fetch(url, fetchOptions);
    } catch (err) {
        throw new Error(`Network error: ${err.message}`);
    }

    // Handle 401 Unauthorized for authenticated requests
    if (!response.ok && response.status === 401 && useAuth) {
        globalThis.location.hash = "#/login";
    }

    // Handle common error responses
    if (!response.ok) {
        throw new Error(await buildErrorMessage(response));
    }

    return parseResponseBody(response);
}

// -------------------------------
// Public JSON helpers
// -------------------------------

export function fetchJson(endpoint) {
    return request(endpoint);
}