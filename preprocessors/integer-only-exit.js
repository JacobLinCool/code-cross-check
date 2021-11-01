/**
 * Extract integers from outputs.
 * But also care about the exit code.
 */
module.exports = (output) => {
    return `!${output.code} ${output.stdout.match(/-?\d+/g).join(" ")}`;
};
