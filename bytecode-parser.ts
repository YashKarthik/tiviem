import { instructions, uint8ArrayToByteString } from "./opcodes";

type Result = {
  success: boolean,
  stack: bigint[],
  memory: Uint8Array,
  gas: number,
  returndata: Uint8Array,
  logs: Log[],
}

export interface Context {
  address: bigint,
  caller: bigint,
  origin: bigint,

  gasPrice: bigint,
  gasLeft: number,
  isStatic: boolean,

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
  logs: Log[],
  //memoryWordCount: bigint
  //highestMemCost: bigint
  stack: bigint[],
  //messageGasLimit?: bigint // Cache value from `gas.ts` to save gas limit for a message call
  //gasRefund: bigint // Tracks the current refund
  returndata: Uint8Array /* Current bytes in the return buffer. Cleared each time a CALL/CREATE is made in the current frame. */
  context: Context,
}

export type Log = {
  address: bigint,
  data: bigint,
  topics: bigint[],
}

export function evm(context: Context): Result {
  console.log("\n\n --------------- NEW CONTEXT ---------------\n\n")

  const runState: RunState = {
    programCounter: 0,
    opcode: 0,
    memory: new Uint8Array(0),
    stack: [],
    context: context,
    returndata: new Uint8Array(0),
    logs: [],
  }

  for (runState.programCounter = 0; runState.programCounter < context.bytecode.length; ) {
    runState.opcode = context.bytecode[runState.programCounter] as keyof typeof instructions;
    const result = instructions[runState.opcode].implementation(runState);

    runState.stack = result.stack;
    runState.programCounter = result.programCounter;
    if (result.memory) runState.memory = result.memory;
    if (result.returndata) runState.returndata = result.returndata;
    if (result.logs) runState.logs.push(...result.logs);

    // Check if operation is reverted before or after performing it,
    // as it will affect the current state of memory, stack
    runState.context.gasLeft -= instructions[runState.opcode].minimumGas;
    if (result.additionalGas) runState.context.gasLeft -= result.additionalGas;
    //if (runState.context.gasLeft < 0) return {
    //  success: false,
    //  stack: runState.stack.reverse(),
    //  memory: runState.memory,
    //  gas: runState.context.gasLeft,
    //  returndata: runState.returndata,
    //  logs: runState.logs,
    //}

    console.log("\x1b[33m%s\x1b[0m", "0x" + runState.opcode.toString(16), "\x1b[37m%s\x1b[0m", instructions[runState.opcode].name + " @ ", "\x1b[33m%s\x1b[0m", "PC=" + runState.programCounter);
    console.log("Stack:", runState.stack);
    console.log("Memory:", "\x1b[33m%s\x1b[0m", uint8ArrayToByteString(runState.memory));
    //console.log("State:", runState.context.state);
    //console.log("Calldata:", runState.context.callData);
    //console.log("Logs:", runState.logs);
    console.log("Returndata:", "\x1b[33m%s\x1b[0m", uint8ArrayToByteString(runState.returndata));
    //console.log("gas:", runState.context.gasLeft);
    console.log("\n");

    if (result.error) {
      console.log("---------- Fatal Error ----------");
      console.log(result.error);
      return {
        success: false,
        stack: runState.stack.reverse(),
        memory: runState.memory,
        gas: runState.context.gasLeft,
        returndata: runState.returndata,
        logs: runState.logs,
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
    returndata: runState.returndata,
    logs: runState.logs
  }
}
