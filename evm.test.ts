import { evm } from "./bytecode-parser";
import { expect, test, afterEach } from "bun:test";
//@ts-expect-error The file exists!
import tests from "./tests";

for (const t of tests as any) {
  test(t.name, () => {
    // Note: as the test cases get more complex, you'll need to modify this
    // to pass down more arguments to the evm function (e.g. block, state, etc.)
    // and return more data (e.g. state, logs, etc.)
    const result = evm(t.code.bin);

    expect(result.success).toEqual(t.expect.success);
    if (!result.stack) console.log(result.trace);
    expect(result.stack).toEqual(t.expect.stack.map((item:any) => BigInt(item)));
  });
}
