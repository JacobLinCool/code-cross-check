/**
 * Trim whitespace and newlines from the beginning and end of the output.
 * But also care about the exit code.
 */
module.exports = (output) => {
    return "!" + output.code + " " + output.stdout.trim();
};
