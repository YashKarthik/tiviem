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
      if (result >= MAX_UINT256 + 1n) return [result % (MAX_UINT256 + 1n)];
      return [ result ];
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
      if (result < 0n) return [MAX_UINT256 + 1n + result];
      return [ result ];
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
      if (b == 0n || a == 0n) return [ 0n ];

      a = BigInt.asIntN(256, a);
      b = BigInt.asIntN(256, b);

      let result = BigInt.asUintN(256, a / b);

      return [ result ];
    }
  },

  0x06: {
    name: 'MOD',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n) return [0n];
      return [a % b];
    },
  },

  0x07: {
    name: 'SMOD',
    minimumGas: 5,
    implementation: (a: bigint, b: bigint) => {
      if (b == 0n) return [0n];
      return [
        BigInt.asUintN(
          256,
          BigInt.asIntN(256, a) % BigInt.asIntN(256, b)
        )
      ];
    },
  },

  0x08: {
    name: 'ADDMOD',
    minimumGas: 8,
    implementation: (a: bigint, b: bigint, N: bigint) => {
      if (N == 0n) return [0n];
      return [ (a + b) % N];
    },
  },
  0x09: {
    name: 'MULMOD',
    minimumGas: 8,
    implementation: (a: bigint, b: bigint, N: bigint) => {
      if (N == 0n) return [0n];
      return [ (a * b) % N];
    },
  },

  0x0a: {
    name: 'EXP',
    minimumGas: 10,
    implementation: (a: bigint, exponent: bigint) => [ BigInt.asUintN(256, a ** exponent) ]
  },

  0x0b: {
    name: 'SIGNEXTEND',
    minimumGas: 5,
    implementation: (b: bigint, x: bigint) => {
      // b: size in bytes - 1 of the integer to extend;
      // x: the integer to extend
      if (!(b < 31n)) {
        // b is not less than 31
        // => x is 32 bytes long (full size) => no sign extension
        return [ x ];
      }

      const bits = (Number(b) + 1)*8 // size of x in bits; safe to use Number(b) as b must resolve to 32 or less;
      const msb = BigInt(1 << bits - 1) & x; // Check the MSB of x
      if (!msb) { // positive number => no sign extension required;
        return [ x ];
      }

      return [ BigInt.asUintN(256, ~msb) | x ];
    }
  },

  // COMPARISON / BITWISE opcodes
  0x10: {
    name: 'LT',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => {
      return [ BigInt(a < b) ];
    },
  },

  0x11: {
    name: 'GT',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => {
      return [ BigInt(a > b) ];
    },
  },

  0x12: {
    name: 'SLT',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => {
      a = BigInt.asIntN(256, a);
      b = BigInt.asIntN(256, b);
      return [ BigInt(a < b) ];
    },
  },

  0x13: {
    name: 'SGT',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => {
      a = BigInt.asIntN(256, a);
      b = BigInt.asIntN(256, b);
      return [ BigInt(a > b) ];
    },
  },

  0x14: {
    name: 'EQ',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [ BigInt(a == b) ]
  },

  0x15: {
    name: 'ISZERO',
    minimumGas: 3,
    implementation: (a: bigint) => [ BigInt(a == 0n) ]
  },

  0x16: {
    name: 'AND',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [BigInt.asUintN(256, a & b)]
  },

  0x17: {
    name: 'OR',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [BigInt.asUintN(256, a | b)]
  },

  0x18: {
    name: 'XOR',
    minimumGas: 3,
    implementation: (a: bigint, b: bigint) => [BigInt.asUintN(256, a ^ b)]
  },

  0x19: {
    name: 'NOT',
    minimumGas: 3,
    implementation: (a: bigint) => [BigInt.asUintN(256, ~a)]
  },

  0x1a: {
    name: 'BYTE',
    minimumGas: 3,
    implementation: (i: bigint, x: bigint) => {
      const hexString = x.toString(16).padStart(64, "0"); // ensures the stack input is 32-bytes (64 chars) long;
      const bytesArray = new Uint8Array(
        (hexString.match(/../g) || [])
        .map((byte) => parseInt(byte, 16))
      );

      return [ BigInt(bytesArray[Number(i)] || 0 ) ]; // don't worry about Number(i) safety; || 0 to account for out of range byte offset
    }
  },

  0x1b: {
    name: 'SHL',
    minimumGas: 3,
    implementation: (shift: bigint, value: bigint) => {
      if (shift > 255n) return [ 0n ];
      return [BigInt.asUintN(256, value << shift)];
    }
  },

  0x1c: {
    name: 'SHR',
    minimumGas: 3,
    implementation: (shift: bigint, value: bigint) => {
      if (shift > 255n) return [ 0n ];
      return [BigInt.asUintN(256, value >> shift)];
    }
  },

  0x1d: {
    name: 'SAR',
    minimumGas: 3,
    implementation: (shift: bigint, value: bigint) => {
      const isSigned = BigInt.asIntN(256, value) < 0;

      if (!isSigned) return [ value >> shift ]; // the incoming bits are 0, which is the msb.

      if (shift > 256n) {
        // we could skip these constant cases as the normal operation would return the same result
        // but doing with these large values, we could run out of memory, especially in JS/TS
        return [ BigInt.asUintN(256, MAX_UINT256) ]; // all the bits will be replaced by 1 => max value;
      }

      const temp = value >> shift
      // next convert the bits that just came in from 0 to 1.
      // A mask that enables `shift` number of bits.
      const mask = MAX_UINT256 << (256n - shift);

      return [ BigInt.asUintN(256,  temp | mask)];
    }
  },


  // STACK MANIPULATION
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

const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"); // 2^256 - 1

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
