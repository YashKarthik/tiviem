import { instructions } from "./opcodes";

try {
  const bytecode = process.argv.slice(2,)[0].slice(2,); // the first slice gets us the passed cmd-line arg, the second slice is to get rid of the 0x
  if (!bytecode) console.log("No bytecode given.");
  evm(bytecode);
} catch {

}

type Result = {
  success: boolean,
  stack: bigint[],
  trace: any[]
}

export function evm(bytecode:string): Result {

  let stack: bigint[] = []; // last index of array is TOP of stack;
  const trace: any[] = [];

  for (let counter = 0; counter < bytecode.length; ) {
    console.log(bytecode.slice(0, counter) + "🔺" + bytecode.slice(counter,));
    trace.push("Stack:" + stack);

    const opcode = parseInt("0x" + bytecode.slice(counter, counter + 2)) as keyof typeof instructions;
    if (isNaN(opcode)) {
      console.log(`Invalid opcode ${opcode}`);
      return { success: false, stack: stack.reverse(), trace };
    }
    counter += 2;

    const result = instructions[opcode].implementation({ stack, bytecode, counter });
    if (result.error) return {
      success: false,
      stack,
      trace
    }

    stack = result.stack;
    counter = result.counter;
    if (!result.continueExecution) break;
  }

  console.log("Final stack:", stack.map(s => "0x" + s.toString(16)));
  return { success: true, stack: stack.reverse(), trace };
}
