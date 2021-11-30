const storage = {};

init();

function init() {
    for (let key in localStorage) {
        try {
            storage[key] = JSON.parse(localStorage[key]);
        } catch (e) {}
    }
}

function save() {
    for (let key in storage) {
        try {
            localStorage[key] = JSON.stringify(storage[key]);
        } catch (e) {}
    }
}

function get(key) {
    return storage[key];
}

function set(key, value) {
    storage[key] = value;
    save();
}

function remove(key) {
    delete storage[key];
    localStorage.removeItem(key);
}

function clear() {
    storage = {};
    localStorage.clear();
}

export { get, set, remove, clear };
