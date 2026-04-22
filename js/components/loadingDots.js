function renderLoadingDots() {
    const dots = document.createElement("span");
    dots.className = "dots";
    dots.innerHTML = `<span>.</span><span>.</span><span>.</span>`;
    return dots;
}

export function renderThinkingMessage(message = "Thinking", wrapperClass = "thinking") {
    const wrapper = document.createElement("div");
    wrapper.className = wrapperClass; // caller decides context

    const text = document.createElement("span");
    text.className = "thinking-label";
    text.textContent = message;

    const dots = renderLoadingDots();

    wrapper.append(text, dots);
    return wrapper;
}