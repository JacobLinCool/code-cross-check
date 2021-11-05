const { VM } = require("vm2");

const pre = `var exports = module.exports;\n`;
const post = `\n;\nmodule.exports;\n`;

module.exports = function run(code) {
    const module = new (require("module"))();
    const vm = new VM({ timeout: 5_000, fixAsync: true, sandbox: { module } });
    return vm.run(pre + code + post);
};
