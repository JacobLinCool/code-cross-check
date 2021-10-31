import { createEditor } from "./editor";
import { testcase, preprocessor, source_0, source_1 } from "./default";

export default async function setUp() {
    const testcase_editor = createEditor({ container: document.querySelector("#testcase-wrap"), language: "javascript", value: testcase });
    const preprocessor_editor = createEditor({ container: document.querySelector("#preprocessor-wrap"), language: "javascript", value: preprocessor });
    const source_0_editor = createEditor({ container: document.querySelector("#source_0-wrap"), language: "c", value: source_0 });
    const source_1_editor = createEditor({ container: document.querySelector("#source_1-wrap"), language: "c", value: source_1 });
    return { testcase_editor, preprocessor_editor, source_0_editor, source_1_editor };
}
