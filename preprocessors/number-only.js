/**
 * Extract numbers (integers and floats) from outputs.
 */
module.exports = (output) => {
    return output.stdout.match(/[+-]?(\d*[.])?\d+/g).join(" ");
};
