function elm(selector) {
    const el = [...document.querySelectorAll(selector)];
    return el.length === 1 ? el[0] : el;
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

export { elm, readFile };
