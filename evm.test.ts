import { Context, evm, State } from "./bytecode-parser";
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

    const worldState = new Map<bigint, State>();
    if (t.state) {
      const addresses = Object.keys(t.state);

      addresses.forEach(address => {
        worldState.set(BigInt(address), { balance: BigInt(t.state[address]["balance"])})
      });

    }

    const context: Context = {
      address: BigInt(t?.tx?.to || 0x00),
      caller: BigInt(t?.tx?.from || 0x00),
      origin: BigInt(t?.tx?.origin || 0x00),

      callValue: BigInt(t?.tx?.value || 0n),
      callData: hexStringToUint8Array(((t?.tx?.data || "00") as string).padEnd(64, "0")),
      gasPrice: BigInt(t?.tx?.gasprice || 0n),
      gasLeft: 15_000_000,

      bytecode: hexStringToUint8Array(t.code.bin),
      block: {
        basefee: BigInt(t?.block?.basefee || 0n),
        coinbase: BigInt(t?.block?.coinbase || 0n),
        timestamp: BigInt(t?.block?.timestamp || 0n),
        number: BigInt(t?.block?.number || 0n),
        difficulty: BigInt(t?.block?.difficulty || 0n),
        gasLimit: BigInt(t?.block?.gaslimit || 0n),
        chainId: BigInt(t?.block?.chainid || 1n),
      },
      state: worldState,
    }

    const result = evm(context);

    expect(result.success).toEqual(t.expect.success);

    if (t.expect.stack) {
      expect(result.stack).toEqual(t.expect.stack.map((item:any) => BigInt(item)));
    }

    if (t.expect.return) {
      expect(result.returndata).toEqual(BigInt("0x" + t.expect.return));
    }
  });
}
