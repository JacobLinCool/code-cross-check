const Module = require("module");
const r = Module.prototype.require;
const _load = module.constructor._load;
const p = process;

module.exports = class Guardian {
    constructor(allowed = []) {
        this.allowed = allowed;
        console.log("[Guardian] Created.", this.allowed);
    }
    protect() {
        const self = this;
        Module.prototype.require = function (...args) {
            if (self.allowed.includes(args[0])) return r.apply(this, args);
            else console.log(`[Guardian] Module "${args[0]}" is not allowed.`);
        };
        module.constructor._load = function (...args) {
            if (self.allowed.includes(args[0])) return _load.apply(this, args);
            else console.log(`[Guardian] Module "${args[0]}" is not allowed.`);
        };
        global.process = {};
        console.log("[Guardian] Protected.");
    }
    die() {
        Module.prototype.require = r;
        module.constructor._load = _load;
        global.process = p;
        console.log("[Guardian] Died.");
    }
};
