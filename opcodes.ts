/**
  * This file contains an object that maps opcode -> `Instruction` where `Instruction` contains the
  * opcode name, minimumGas and implementation for the opcode.
  * The math needs to be fixed to replicate EVM errors / edgecases.
  **/
type Instruction = {
  name: string,
  minimumGas: number,
  implementation: Function
}

export const instructions = {
  0x00: {
    name: 'STOP',
    minimumGas: 0,
    implementation: () => { throw new Error("STOP") }
  },
  0x01: {
    name: 'ADD',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [a + b],
  },
  0x02: {
    name: 'MUL',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => [a * b],
  },
  0x03: {
    name: 'SUB',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [a - b],
  },
  0x04: {
    name: 'DIV',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n || a == 0n) return [0n];
      return [(a / b)];
    },
  },
  0x5F: {
    name: 'PUSH0',
    minimumGas: 2,
    implementation: () => [0n],
  },
  0x60: {
    name: 'PUSH1',
    minimumGas: 3,
    implementation: (a: bigint) => [a],
  },
  0x61: {
    name: 'PUSH2',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [a, b],
  },
};
