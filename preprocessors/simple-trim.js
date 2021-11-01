/**
 * Trim whitespace and newlines from the beginning and end of the output.
 */
module.exports = (output) => {
    return output.stdout.trim();
};
