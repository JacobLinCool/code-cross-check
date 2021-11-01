/**
 * Extract integers from outputs.
 */
module.exports = (output) => {
    return output.stdout.match(/-?\d+/g).join(" ");
};
