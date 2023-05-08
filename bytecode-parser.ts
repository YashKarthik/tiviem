import { instructions } from "./opcodes";

type Result = {
  success: boolean,
  stack: bigint[],
  memory: Uint8Array,
  gas: number,
  returndata: BigInt,
}

export interface Context {
  address: bigint,
  caller: bigint,
  origin: bigint,
  gasPrice: bigint,
  gasLeft: number,
  callValue: bigint
  callData: Uint8Array

  bytecode: Uint8Array,

  block: Block,
  state: Map<bigint, AccountState>, // address -> State
}

export type AccountState = {
  balance: bigint,
  code?: {
    asm: string | null,
    bin: Uint8Array
  },
  storage?: Map<bigint, bigint>,
}

type Block = {
  basefee: bigint,
  coinbase: bigint,
  timestamp: bigint,
  number: bigint,
  difficulty: bigint,
  gasLimit: bigint,
  chainId: bigint,
}

export interface RunState {
  programCounter: number
  opcode: number
  memory: Uint8Array,
  //memoryWordCount: bigint
  //highestMemCost: bigint
  stack: bigint[],
  //messageGasLimit?: bigint // Cache value from `gas.ts` to save gas limit for a message call
  //gasRefund: bigint // Tracks the current refund
  returndata: bigint /* Current bytes in the return buffer. Cleared each time a CALL/CREATE is made in the current frame. */
  context: Context,
}

export function evm(context: Context): Result {

  const runState: RunState = {
    programCounter: 0,
    opcode: 0,
    memory: new Uint8Array(0),
    stack: [],
    context: context,
    returndata: 0n,
  }


  for (runState.programCounter = 0; runState.programCounter < context.bytecode.length; ) {
    runState.opcode = context.bytecode[runState.programCounter] as keyof typeof instructions;
    const result = instructions[runState.opcode].implementation(runState);

    runState.stack = result.stack;
    runState.programCounter = result.programCounter;
    if (result.memory) runState.memory = result.memory;
    if (result.returndata) runState.returndata = result.returndata;

    // Check if operation is reverted before or after performing it,
    // as it will affect the current state of memory, stack
    runState.context.gasLeft -= instructions[runState.opcode].minimumGas;
    if (result.additionalGas) runState.context.gasLeft -= result.additionalGas;
    if (runState.context.gasLeft < 0) return {
      success: false,
      stack: runState.stack.reverse(),
      memory: runState.memory,
      gas: runState.context.gasLeft,
      returndata: runState.returndata
    }

    console.log("\x1b[33m%s\x1b[0m", "0x" + runState.opcode.toString(16), "\x1b[37m%s\x1b[0m", instructions[runState.opcode].name + " @ ", "\x1b[33m%s\x1b[0m", "PC=" + runState.programCounter);
    console.log("Stack:", runState.stack);
    console.log("Memory:", runState.memory);
    console.log("State:", runState.context.state);
    console.log("Calldata:", runState.context.callData);
    console.log("gas:", runState.context.gasLeft, "\n");

    if (result.error) {
      console.log("---------- Fatal Error ----------");
      console.log(result.error);
      return {
        success: false,
        stack: runState.stack.reverse(),
        memory: runState.memory,
        gas: runState.context.gasLeft,
        returndata: runState.returndata
      }
    }
    if (!result.continueExecution) break;
  }

  console.log("Final stack:", runState.stack.map(s => "0x" + s.toString(16)));
  console.log("Returndata:", runState.returndata);
  return {
    success: true,
    stack: runState.stack.reverse(),
    memory: runState.memory,
    gas: runState.context.gasLeft,
    returndata: runState.returndata
  }
}
