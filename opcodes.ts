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
    implementation: (a: bigint, b: bigint) => {
      const result = a + b;
      if (result >= MAX_UINT256) return [result % MAX_UINT256];
      return [result];
    },
  },
  0x02: {
    name: 'MUL',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      return [ BigInt.asUintN(256, a * b) ];
    },
  },
  0x03: {
    name: 'SUB',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => {
      const result = a - b;
      if (result < 0n) return [MAX_UINT256 + result];
      return [result];
    },
  },
  0x04: {
    name: 'DIV',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n || a == 0n) return [0n];
      if (a < b) return [0n];

      const result = a % MAX_UINT256;
      if (result < 0n) return [ result + MAX_UINT256 ];
      return [ result ]
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
    implementation: () => [],
  },
  0x61: {
    name: 'PUSH2',
    minimumGas: 3,
    implementation: () => [],
  },
  0x7F: {
    name: 'PUSH32',
    minimumGas: 3,
    implementation: () => [],
  },
};

const MAX_UINT256 = 2n ** 256n;
