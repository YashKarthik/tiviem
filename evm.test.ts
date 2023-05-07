import { evm } from "./bytecode-parser";
import { expect, test } from "bun:test";
import { hexStringToUint8Array } from "./opcodes";

//@ts-expect-error The file exists!
import tests from "./tests";

for (const t of tests as any) {
  test(t.name, () => {
    // Note: as the test cases get more complex, you'll need to modify this
    // to pass down more arguments to the evm function (e.g. block, state, etc.)
    // and return more data (e.g. state, logs, etc.)

    console.log("\n\n-------", t.name, "-------\n");
    console.log("Test bytecode: 0x"+t.code.bin);
    console.log("Test opcodes");
    console.log("\x1b[34m%s\x1b[0m", t.code.asm, "\n");
    const result = evm(hexStringToUint8Array(t.code.bin), 15_000_000);

    expect(result.success).toEqual(t.expect.success);

    if (t.expect.stack) {
      expect(result.stack).toEqual(t.expect.stack.map((item:any) => BigInt(item)));
    }

    if (t.expect.return) {
      expect(result.returndata).toEqual(BigInt("0x" + t.expect.return));
    }
  });
}
