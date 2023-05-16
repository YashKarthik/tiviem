import { instructions, uint8ArrayToHexString } from "./opcodes";

type Result = {
  success: boolean,
  stack: bigint[],
  memory: Uint8Array,
  gas: number,
  returndata: Uint8Array,
  logs: Log[],
  state: Map<bigint, AccountState>,
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
    asm?: string,
    bin: Uint8Array
  },
  storage?: Map<bigint, bigint>,
  nonce: bigint
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

export function evm(context: Context, verbose = 1): Result {
  console.log('\x1b[32m%s\x1b[0m', "\n --------------- NEW CONTEXT ---------------\n")

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

    if (runState.context.callValue > runState.context.state.get(runState.context.caller)!.balance) {
      console.log('\x1b[31m%s\x1b[0m', '\n------- OUT OF ETHER ------\n');
      //return {
      //  success: false,
      //  stack: runState.stack.reverse(),
      //  memory: runState.memory,
      //  gas: runState.context.gasLeft,
      //  returndata: runState.returndata,
      //  logs: runState.logs,
      //  state: runState.context.state,
      //}
    }

    // subtract callvalue from caller's balance
    if (runState.context.state.get(runState.context.caller)?.code) {
      if (runState.context.state.get(runState.context.caller)?.storage) {
        runState.context.state.set(runState.context.caller, {
          balance: runState.context.state.get(runState.context.caller)!.balance - runState.context.callValue,
          nonce: runState.context.state.get(runState.context.caller)!.nonce,
          code: {
            asm: runState.context.state.get(runState.context.caller)!.code?.asm,
            bin: runState.context.state.get(runState.context.caller)!.code!.bin
          },
          storage: runState.context.state.get(runState.context.caller)!.storage
        });
      } else {
        runState.context.state.set(runState.context.caller, {
          balance: runState.context.state.get(runState.context.caller)!.balance - runState.context.callValue,
          nonce: runState.context.state.get(runState.context.caller)!.nonce,
          code: {
            asm: runState.context.state.get(runState.context.caller)!.code?.asm,
            bin: runState.context.state.get(runState.context.caller)!.code!.bin
          },
        });
      }
    } else {
      runState.context.state.set(runState.context.caller, {
        balance: runState.context.state.get(runState.context.caller)!.balance - runState.context.callValue,
        nonce: runState.context.state.get(runState.context.caller)!.nonce,
      });
    }

    const result = instructions[runState.opcode].implementation(runState);

    // Operation returns the new state and other data;
    // We discard the changes if the calculated gas consumption is more than whan we have
    runState.context.gasLeft -= instructions[runState.opcode].minimumGas;
    if (result.additionalGas) runState.context.gasLeft -= result.additionalGas;
    if (runState.context.gasLeft < 0) {
      console.log('\x1b[31m%s\x1b[0m', '\n------- OUT OF GAS ------\n');
      //return {
      //  success: false,
      //  stack: runState.stack.reverse(),
      //  memory: runState.memory,
      //  gas: runState.context.gasLeft,
      //  returndata: runState.returndata,
      //  logs: runState.logs,
      //  state: runState.context.state,
      //}
    }

    // Since we didn't run out of gas, we shall assign the calculated state (and other data) to our context's data;

    runState.stack = result.stack;
    runState.programCounter = result.programCounter;
    if (result.memory) runState.memory = result.memory;
    if (result.returndata) runState.returndata = result.returndata;
    if (result.logs) runState.logs.push(...result.logs);
    if (result.state) runState.context.state = result.state;

    if (verbose >= 1) {
      console.log("\x1b[33m%s\x1b[0m", "0x" + runState.opcode.toString(16), "\x1b[0m%s\x1b[0m", instructions[runState.opcode].name + " @ ", "\x1b[33m%s\x1b[0m", "PC=" + runState.programCounter);
    }
    if (verbose >= 2) {
      console.log("\nStack:", runState.stack);
      console.log("Memory:", "\x1b[33m%s\x1b[0m", uint8ArrayToHexString(runState.memory));
      console.log("Gas:", runState.context.gasLeft, "\n");
    }
    if (verbose >= 3) {
      console.log("State:", runState.context.state);
      console.log("Calldata:", runState.context.callData);
      console.log("Logs:", runState.logs);
      console.log("Returndata:", "\x1b[33m%s\x1b[0m", uint8ArrayToHexString(runState.returndata), "\n");
    }

    if (result.error) {
      console.log('\x1b[31m%s\x1b[0m', '\n---------- Fatal Error ----------');
      console.log(result.error);
      return {
        success: false,
        stack: runState.stack.reverse(),
        memory: runState.memory,
        gas: runState.context.gasLeft,
        returndata: runState.returndata,
        logs: runState.logs,
        state: runState.context.state
      }
    }
    if (!result.continueExecution) break;
  }

  console.log('\x1b[32m%s\x1b[0m', "\n --------------- END of CONTEXT ---------------\n")
  console.log("Final stack:", runState.stack.map(s => "0x" + s.toString(16)));
  console.log("Returndata:", runState.returndata, "\n");
  return {
    success: true,
    stack: runState.stack.reverse(),
    memory: runState.memory,
    gas: runState.context.gasLeft,
    returndata: runState.returndata,
    logs: runState.logs,
    state: runState.context.state
  }
}
