/**
 * Extract numbers (integers and floats) from outputs.
 * But also care about the exit code.
 */
module.exports = (output) => {
    return `!${output.code} ${output.stdout.match(/[+-]?(\d*[.])?\d+/g).join(" ")}`;
};
