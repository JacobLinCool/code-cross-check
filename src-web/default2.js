const testcase = `
function cards() {
    const all = Array.from({ length: 52 }, (_, i) => i + 1);
    const shuffled = all.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 13);
}

const rules = [
    {
        name: "Testcases",
        generator: () => cards().join(" "),
        repeat: 1000,
    },
];

module.exports = rules;
`.trim();

const preprocessor = `
module.exports = (output) => {
    output.stdout = output.stdout.toLowerCase();
    if (output.code === 1 || output.stdout.indexOf("error") !== -1) return "!ERROR 1";
    const HCP = +output.stdout.match(/(\\d+)\\s?pts/)[1];
    const Suits = output.stdout
        .match(/\\d+-\\d+-\\d+-\\d+/)[0]
        .split("-")
        .map(Number);
    const Choice = output.stdout.match(/choice\\s?:\\s?(\\w+)/)[1].trim();
    return \`\${HCP} \${Suits.join(" ")} \${Choice}\`;
};
`.trim();

const source_0 = `
// Copyright (c) JacobLinCool<https://github.com/JacobLinCool>

#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main() {
    int32_t cards[13] = { 0 };

    for (int8_t i = 0; i < 13; i++) {
        printf("%d%s card: ", i + 1, (i == 0) ? "st" : (i == 1) ? "nd" : (i == 2) ? "rd" : "th");
        if (scanf("%d", &cards[i]) != 1 || cards[i] < 1 || cards[i] > 52) {
            printf("Invalid Input!\\n");
            return 1;
        }
    }
    printf("---\\n");

    // suit[0] = "Spades", suit[1] = "Hearts", suit[2] = "Diamonds", suit[3] = "Clubs";
    int32_t hcp = 0, suit[4] = { 0 };

    // calculate HCP
    for (int8_t i = 0; i < 13; i++) {
        if (cards[i] % 13 == 1) hcp += 4;
        else if (cards[i] % 13 == 0) hcp += 3;
        else if (cards[i] % 13 == 12) hcp += 2;
        else if (cards[i] % 13 == 11) hcp += 1;
    }

    // calculate suit
    for (int8_t i = 0; i < 13; i++) suit[(cards[i] - 1) / 13]++;

    printf("HCP: %d pts\\n", hcp);
    printf("Suit: %d-%d-%d-%d\\n", suit[0], suit[1], suit[2], suit[3]);

    // Apply Rule 8 if there is no other conditions are satisfied 
    char choice[5];

    // Rule 1
    if (hcp >= 22) strcpy(choice, "2C");
    // Rule 2
    else if (suit[0] >= 5 && (suit[0] >= suit[1] && suit[0] >= suit[2] && suit[0] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1S");
    else if (suit[1] >= 5 && (suit[1] >= suit[0] && suit[1] >= suit[2] && suit[1] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1H");
    // Rule 3
    else if (16 <= hcp && hcp <= 18) strcpy(choice, "1NT");
    // Rule 4
    else if (20 <= hcp && hcp <= 21) strcpy(choice, "2NT");
    // Rule 5
    else if (suit[2] >= 3 && (suit[2] >= suit[0] && suit[2] >= suit[1] && suit[2] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1D");
    else if (suit[3] >= 3 && (suit[3] >= suit[0] && suit[3] >= suit[1] && suit[3] >= suit[2]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1C");
    // Rule 6
    else if (suit[0] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3S");
    else if (suit[1] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3H");
    else if (suit[2] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3D");
    else if (suit[3] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3C");
    // Rule 7
    else if (suit[0] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2S");
    else if (suit[1] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2H");
    else if (suit[2] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2D");
    else strcpy(choice, "Pass");

    printf("The bidding choice : %s\\n", choice);

    return 0;
}
`.trim();

const source_1 = `
// Copyright (c) Howchien<https://github.com/howard9199>

#include <stdio.h>

int UI_inputCard(int i) {
    int inputCard;
    if (i == 1) {
        printf("1st card: ");
    }
    else if (i == 2) {
        printf("2nd card: ");
    }
    else if (i == 3) {
        printf("3rd card: ");
    }
    else if (i < 10) {
        printf("%dth card: ", i);
    }
    else {
        printf("%d th card: ", i);
    }
    scanf("%d", &inputCard);
    return inputCard;
}
int addHCP(int cardNum) {
    cardNum -= ((cardNum - 1) / 13) * 13;
    switch (cardNum) {
    case 1:
        return 4;
    case 11:
        return 1;
    case 12:
        return 2;
    case 13:
        return 3;
    default:
        return 0;
    }
}
int least_num(int numOfSuit[], int least) {
    for (int i = 0; i < 4; i++) {
        if (i == 3 && least == 6)return -1;
        if (numOfSuit[i] >= least) {
            return i;
        }
    }
    return -1;
}
int suitIsMost(int suit, int numOfSuit[]) {
    for (int i = 0; i < 4; i++) {
        if (numOfSuit[suit] < numOfSuit[i]) {
            return 0;
        }
    }
    return 1;
}
void biddingChoice(int HCP, int numOfSuit[]) {
    printf("The bidding choice : ");
    if (HCP >= 22) {
        printf("2C");
    }
    else if (13 <= HCP &&
        ((numOfSuit[0] >= 5 && suitIsMost(0, numOfSuit)) || (numOfSuit[1] >= 5 && suitIsMost(1, numOfSuit)))) {
        if (numOfSuit[0] >= numOfSuit[1]) {
            printf("1S");
        }
        else {
            printf("1H");
        }
    }
    else if (16 <= HCP && HCP <= 18) {
        printf("1NT");
    }
    else if (20 <= HCP && HCP <= 21) {
        printf("2NT");
    }
    else if (13 <= HCP &&
        ((numOfSuit[2] >= 3 && suitIsMost(2, numOfSuit)) || (numOfSuit[3] >= 3 && suitIsMost(3, numOfSuit)))) {
        if (numOfSuit[2] >= numOfSuit[3]) {
            printf("1D");
        }
        else {
            printf("1C");
        }
    }
    else if (10 <= HCP && HCP <= 12 &&
        least_num(numOfSuit, 7) != -1) {
        switch (least_num(numOfSuit, 7)) {
        case 0:
            printf("3S");
            break;
        case 1:
            printf("3H");
            break;
        case 2:
            printf("3D");
            break;
        case 3:
            printf("3C");
            break;
        }
    }
    else if (10 <= HCP && HCP <= 12 &&
        least_num(numOfSuit, 6) != -1) {
        switch (least_num(numOfSuit, 6)) {
        case 0:
            printf("2S");
            break;
        case 1:
            printf("2H");
            break;
        case 2:
            printf("2D");
            break;
        }
    }
    else {
        printf("Pass");
    }
    printf("\\n");
    return;
}
int main() {
    //freopen("hw0205.in","r",stdin);
    int nowCard;
    int HCP = 0;
    int numOfSuit[4] = { 0,0,0,0 };

    for (int i = 1; i <= 13; i++) {
        nowCard = UI_inputCard(i);
        if (nowCard < 1 || nowCard > 52) {
            printf("Error\\n");
            return 0;
        }
        numOfSuit[(nowCard - 1) / 13]++;
        HCP += addHCP(nowCard);
    }
    printf("---\\n");
    printf("HCP: %d pts\\n", HCP);
    printf("Suit: %d-%d-%d-%d\\n", numOfSuit[0], numOfSuit[1], numOfSuit[2], numOfSuit[3]);
    biddingChoice(HCP, numOfSuit);

    return 0;
}
`.trim();

export { testcase, preprocessor, source_0, source_1 };
