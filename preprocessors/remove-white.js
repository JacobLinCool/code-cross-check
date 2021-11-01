/**
 * Remove all whitespace and newlines from the output.
 */
module.exports = (output) => {
    return output.stdout.replace(/\s/g, "");
};
