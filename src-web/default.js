const testcase = `
function num() {
    return -5 * 1e9 + Math.floor(1e10 * Math.random());
}

const rules = [
    {
        name: "SUM TESTCASES",
        generator: () => \`\${num()} \${num()}\`,
        repeat: 100,
    },
];

module.exports = rules;
`.trim();

const preprocessor = `
module.exports = (output) => {
    return output.stdout.match(/-?\\d+/g).join(" ");
};
`.trim();

const source_0 = `
#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>

int main() {
    int64_t a, b;
    scanf("%" PRId64 " %" PRId64, &a, &b);
    printf("%" PRId64 "\\n", a + b);
    return 0;
}
`.trim();

const source_1 = `
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    int sum = a + b;
    printf("SUM: %d\\n", sum);
    return 0;
}
`.trim();

export { testcase, preprocessor, source_0, source_1 };
