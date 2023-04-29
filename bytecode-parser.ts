import { hexStringToUint8Array } from "./evm.test";
import { instructions } from "./opcodes";

try {
  const bytecode = process.argv.slice(2,)[0].slice(2,); // the first slice gets us the passed cmd-line arg, the second slice is to get rid of the 0x
  if (!bytecode) console.log("No bytecode given.");
  evm(hexStringToUint8Array(bytecode));
} catch {

}

type Result = {
  success: boolean,
  stack: bigint[],
  trace: any[]
}

export function evm(bytecode: Uint8Array): Result {

  let stack: bigint[] = []; // last index of array is TOP of stack;
  const trace: any[] = [];

  for (let counter = 0; counter < bytecode.length; ) {
    trace.push("Stack:" + stack);

    const opcode = (bytecode.slice(counter, counter + 1)[0]) as keyof typeof instructions;
    console.log("Opcode:", "0x" + opcode.toString(16), instructions[opcode].name, stack);

    const result = instructions[opcode].implementation({ stack, bytecode, counter });
    stack = result.stack;
    counter = result.counter;

    if (result.error) {
      console.log("---------- Fatal Error ----------");
      console.log(result.error);
      return {
        success: false,
        stack: stack.reverse(),
        trace
      }
    }
    if (!result.continueExecution) break;
  }

  console.log("Final stack:", stack.map(s => "0x" + s.toString(16)));
  return { success: true, stack: stack.reverse(), trace };
}
