import { instructions } from "./opcodes";

type Result = {
  success: boolean,
  stack: bigint[],
  memory: Uint8Array,
  gas: number,
  returndata: BigInt,
}

export function evm(bytecode: Uint8Array, gas: number): Result {

  let stack: bigint[] = []; // last index of array is TOP of stack;
  let memory: Uint8Array = new Uint8Array(0);
  let returndata: BigInt = 0n;

  for (let counter = 0; counter < bytecode.length; ) {
    const opcode = (bytecode.slice(counter, counter + 1)[0]) as keyof typeof instructions;


    const result = instructions[opcode].implementation({ stack, bytecode, counter, memory, gas });
    stack = result.stack;
    counter = result.counter;
    if (result.memory) memory = result.memory;
    if (result.returndata) returndata = result.returndata;

    // Check if operation is reverted before or after performing it,
    // as it will affect the current state of memory, stack
    gas -= instructions[opcode].minimumGas;
    if (result.additionalGas) gas -= result.additionalGas;
    if (gas < 0) return {
      success: false,
      stack: stack.reverse(),
      memory,
      gas,
      returndata
    }

    console.log("\x1b[33m%s\x1b[0m", "0x" + opcode.toString(16), "\x1b[37m%s\x1b[0m", instructions[opcode].name + " @ ", "\x1b[33m%s\x1b[0m", "PC=" + counter);
    console.log("Stack:", stack);
    console.log("Memory:", memory);
    console.log("gas:", gas, "\n");

    if (result.error) {
      console.log("---------- Fatal Error ----------");
      console.log(result.error);
      return {
        success: false,
        stack: stack.reverse(),
        memory,
        gas,
        returndata
      }
    }
    if (!result.continueExecution) break;
  }

  console.log("Final stack:", stack.map(s => "0x" + s.toString(16)));
  console.log("Returndata:", returndata);
  return {
    success: true,
    stack: stack.reverse(),
    memory,
    gas,
    returndata,
  };
}
