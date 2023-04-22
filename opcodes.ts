/**
  * This file contains an object that maps opcode -> `Instruction` where `Instruction` contains the
  * opcode name, minimumGas and implementation for the opcode.
  * The math needs to be fixed to replicate EVM errors / edgecases.
  **/
type Instruction = {
  opcode: string,
  name: string,
  minimumGas: number,
  implementation: Function
}

export const instructions: { [opcode: string]: Instruction }  = {
  '00': {
    opcode: '00',
    name: 'STOP',
    minimumGas: 0,
    implementation: () => { throw new Error("STOP") }
  },
  '01': {
    opcode: '01',
    name: 'ADD',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [a + b],
  },
  '02': {
    opcode: '02',
    name: 'MUL',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => [a * b],
  },
  '03': {
    opcode: '03',
    name: 'SUB',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [a - b],
  },
  '04': {
    opcode: '04',
    name: 'DIV',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n || a == 0n) return 0;
      return [(a / b)];
    },
  },
};
