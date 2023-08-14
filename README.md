# tiviem

A rudimentary implementation of the Ethereum Virtual Machine in Typescript /ti:vi:εm/.

## What does it do
- The EVM is a stack-based computer, responsible for the execution of smart contract instructions.
- Tiviem implements all instructions defined in the Shanghai hardfork.
- Given some bytecode and an execution context with the relevant state values setup, Tiviem will step through the bytecode and execute each of the instructions and apply the state changes.

## Some details about how it works
- Tiviem is composed of a simple call stack, a bytecode interpreter, the execution context and implementations of each of the instructions.
- The call stack is implemented as an array of bigints, Uint8Array is used for memory and bytecode, while a Map is used to represent storage, world-state.
- All opcodes share a standard interface for passing argument, resulting in consistent and predictable code. (See `opcodes.ts`)
- A CLI is provided for experimentation with arbitrary bytecode. For more control, a custom execution context can be passed into the `evm()` function.

## CLI usage
Example usage:
```bash
$ bun run cli.ts --code 6001600202 --verbose 2
```
- `verbose` or `v`: sets verbosity level for trace. Options: 0, 1, 2, 3.
- `code` or `c`: flag to provide the bytecode to execute. (required)
- `tx`: flag to provide transaction details. (see definiton of `Transaction` interface)

## Setting up execution context
```ts
export interface Context {
  address: bigint,  // address of the contract being called in current tx
  caller: bigint,   // address of the caller
  origin: bigint,   // address of the call origin

  gasPrice: bigint, // current gas price, used in the respective opcode
  gasLeft: number,
  isStatic: boolean,    // weather or not the current call is allowed to perform a state change
  callValue: bigint,    // ether passed in current call
  callData: Uint8Array  // hex data passed in current call
  bytecode: Uint8Array, // bytecode of contract being called

  block: Block,
  state: Map<bigint, AccountState>, // set the state up
}
```

- When calling `evm(context, verbosity);` you must provide it with the above information about the current call.

## Why did I build it
This year I had planned to dive deep into the Ethereum core and what better way than to rebuild (a part of) it.

## Other
- See [blog post](https://www.yashkarthik.xyz/archive/building-tiviem-0) for reasoning on some technical decisions I made.
- I've attempted to write fairly functional-style code, I deviate in places where I had to wack my head against my keyboard.
- If you're planning on building an EVM I've left some resources below. Feel free to contact me ([twitter](https://twitter.com/_yashkarthik)/[warpcast](https://warpcast.com/yashkarthik))
- Gas accounting and state revertions (REVERT) may not work. I haven't figured out a way to test this other than console-logging heavily (my eyes are scared of hex now!!).

## Useful stuff

- [learnevm.com](https://learnevm.com)
- [Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)
- [Evmfromscratch](https://www.evmfromscratch.com/)
- [Building an EVM from Scratch](https://www.notion.so/Building-an-EVM-from-scratch-part-1-the-execution-context-c28ebb4200c94f6fb75948a5feffc686) by [0xkarmacoma](https://twitter.com/0xkarmacoma)
- [A Playdate with the EVM](https://femboy.capital/evm-pt1)

###### This project was created using `bun init` in bun v0.5.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
