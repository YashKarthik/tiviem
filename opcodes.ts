/**
  * This file contains an object that maps opcode -> `Instruction` where `Instruction` contains the
  * opcode name, minimumGas and implementation for the opcode.
  * The math needs to be fixed to replicate EVM errors / edgecases.
  **/

export const instructions = {
  0x00: {
    name: 'STOP',
    minimumGas: 0,
    implementation: () => []
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

      let result = a / b;
      if (result < 0 && a > 0 && b > 0 || result > 0 && a < 0 && b < 0) {
        result = floorBigInt(result);
      } else {
        result = ceilBigInt(result);
      }

      return [ result ];
    },
  },
  0x05: {
    name: 'SDIV',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n || a == 0n) return [0n];

      let sign = 1n;
      const isANegative = isNegativeUint(a);
      const isBNegative = isNegativeUint(b);

      if (!(isANegative && isBNegative)) {}                   // both positive => positive
      else if (isANegative && isBNegative) {}                 // both negative => positive
      else if (!isANegative && isBNegative) { sign = -1n }    // positive, neg => neg
      else if (isANegative && !isBNegative) { sign = -1n }    // positive, neg => neg

      let result = a / b;
      if (result < 0 && a > 0 && b > 0 || result > 0 && a < 0 && b < 0) {
        result = floorBigInt(sign*result);
      } else {
        result = ceilBigInt(sign*result);
      }

      return [ result ];
    },
  },

  0x06: {
    name: 'MOD',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n) return [0n];
      return [a % b];
    },
  },

  0x50: {
    name: 'POP',
    minimumGas: 2,
    implementation: (_a: bigint) => [],
  },

  // 0x5F - 0x7F: PUSH range.
  0x5F: {
    name: 'PUSH0',
    minimumGas: 2,
    implementation: () => [0n],
  },
  0x60: { name: 'PUSH1', minimumGas: 3 },
  0x61: { name: 'PUSH2', minimumGas: 3 },
  0x62: { name: 'PUSH3', minimumGas: 3 },
  0x63: { name: 'PUSH4', minimumGas: 3 },
  0x64: { name: 'PUSH5', minimumGas: 3 },
  0x65: { name: 'PUSH6', minimumGas: 3 },
  0x66: { name: 'PUSH7', minimumGas: 3 },
  0x67: { name: 'PUSH8', minimumGas: 3 },
  0x68: { name: 'PUSH9', minimumGas: 3 },
  0x69: { name: 'PUSH10', minimumGas: 3 },
  0x6a: { name: 'PUSH11', minimumGas: 3 },
  0x6b: { name: 'PUSH12', minimumGas: 3 },
  0x6c: { name: 'PUSH13', minimumGas: 3 },
  0x6d: { name: 'PUSH14', minimumGas: 3 },
  0x6e: { name: 'PUSH15', minimumGas: 3 },
  0x6f: { name: 'PUSH16', minimumGas: 3 },
  0x70: { name: 'PUSH17', minimumGas: 3 },
  0x71: { name: 'PUSH18', minimumGas: 3 },
  0x72: { name: 'PUSH19', minimumGas: 3 },
  0x73: { name: 'PUSH20', minimumGas: 3 },
  0x74: { name: 'PUSH21', minimumGas: 3 },
  0x75: { name: 'PUSH22', minimumGas: 3 },
  0x76: { name: 'PUSH23', minimumGas: 3 },
  0x77: { name: 'PUSH24', minimumGas: 3 },
  0x78: { name: 'PUSH25', minimumGas: 3 },
  0x79: { name: 'PUSH26', minimumGas: 3 },
  0x7a: { name: 'PUSH27', minimumGas: 3 },
  0x7b: { name: 'PUSH28', minimumGas: 3 },
  0x7c: { name: 'PUSH29', minimumGas: 3 },
  0x7d: { name: 'PUSH30', minimumGas: 3 },
  0x7e: { name: 'PUSH31', minimumGas: 3 },
  0x7f: { name: 'PUSH32', minimumGas: 3 },
};

const MAX_UINT256 = 2n ** 256n;

function floorBigInt(n: bigint): bigint {
  let msd = n & -(1n << 53n); // get the most significant digit
  let delta = msd & (1n << 53n) - 1n; // get the lower 53 bits

  if (delta != 0n) return n - delta;
  // otherwise simply return the number
  return n;
}

function ceilBigInt(n: bigint): bigint {
  let msd = n & -(1n << 53n);
  let delta = msd & (1n << 53n) - 1n;

  // if the delta bit is set, the number is negative, so add delta
  if (delta != 0n) return n + delta;
  // otherwise simply return the number
  return n;
}

function isNegativeUint(n: bigint): boolean {
  return (n & 0x8000000000000000000000000000000000000000000000000000000000000000n) !== 0n;
}
