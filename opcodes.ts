/**
  * This file contains an object that maps opcode -> `Instruction` where `Instruction` contains the
  * opcode name, minimumGas and implementation for the opcode.
  * The math needs to be fixed to replicate EVM errors / edgecases.
  **/

type InstructionInput = {
  stack: readonly bigint[],
  bytecode: string,
  counter: number
}

type InstructionOutput = {
  stack: bigint[],
  counter: number,
  continueExecution: boolean
  error: string | null,
}

interface Instruction {
  name: string;
  minimumGas: number;
  implementation: (input: InstructionInput) => InstructionOutput;
}

export const instructions: { [key: number]: Instruction } = {
  0x00: {
    name: 'STOP',
    minimumGas: 0,
    implementation: ({ counter, stack }) => ({ stack: stack.map(s => s), counter: counter, continueExecution: false, error: null})
  },
  0x01: {
    name: 'ADD',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };

      const newStack = tempStack.concat(BigInt.asUintN(256, a + b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },
  0x02: {
    name: 'MUL',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a * b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },
  0x03: {
    name: 'SUB',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a - b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },
  0x04: {
    name: 'DIV',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (b == 0n || a == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a / b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },
  0x05: {
    name: 'SDIV',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const ta = tempStack.pop();
      const tb = tempStack.pop();
      if (!(typeof ta == "bigint" && typeof tb == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const a = BigInt.asIntN(256, ta);
      const b = BigInt.asIntN(256, tb);
      if (b == 0n || a == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a / b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x06: {
    name: 'MOD',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (b == 0n || a == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a % b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x07: {
    name: 'SMOD',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const ta = tempStack.pop();
      const tb = tempStack.pop();
      if (!(typeof ta == "bigint" && typeof tb == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const a = BigInt.asIntN(256, ta);
      const b = BigInt.asIntN(256, tb);
      if (b == 0n || a == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat( BigInt.asUintN( 256, BigInt.asIntN(256, a) % BigInt.asIntN(256, b)));
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x08: {
    name: 'ADDMOD',
    minimumGas: 8,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      const N = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint" && typeof N == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (N == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, (a + b) % N))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },
  0x09: {
    name: 'MULMOD',
    minimumGas: 8,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();
      const N = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint" && typeof N == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (N == 0n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: true,
        error: null
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, (a * b) % N))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x0a: {
    name: 'EXP',
    minimumGas: 10,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const exponent = tempStack.pop();

      if (!(typeof a == "bigint" && typeof exponent == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, (a ** exponent)))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x0b: {
    name: 'SIGNEXTEND',
    minimumGas: 5,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const b = tempStack.pop();
      const x = tempStack.pop();

      if (!(typeof b == "bigint" && typeof x == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };

      // b: size in bytes - 1 of the integer to extend;
      // x: the integer to extend
      if (!(b < 31n)) {
        // b is not less than 31
        // => x is 32 bytes long (full size) => no sign extension
        const newStack = tempStack.concat(BigInt.asUintN(256, x))
        return {
          stack: newStack,
          counter,
          continueExecution: true,
          error: null
        };
      }

      const bits = (Number(b) + 1)*8 // size of x in bits; safe to use Number(b) as b must resolve to 32 or less;
      const msb = BigInt(1 << bits - 1) & x; // Check the MSB of x
      if (!msb) { // positive number => no sign extension required;
        const newStack = tempStack.concat(BigInt.asUintN(256, x))
        return {
          stack: newStack,
          counter,
          continueExecution: true,
          error: null
        };
      }

      const newStack = tempStack.concat(BigInt.asUintN(256, ~msb | x))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    }
  },

  //// COMPARISON / BITWISE opcodes
  0x10: {
    name: 'LT',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a < b) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x11: {
    name: 'GT',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a > b) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x12: {
    name: 'SLT',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const ta = tempStack.pop();
      const tb = tempStack.pop();

      if (!(typeof ta == "bigint" && typeof tb == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const a = BigInt.asIntN(256, ta);
      const b = BigInt.asIntN(256, tb);
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a < b) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x13: {
    name: 'SGT',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const ta = tempStack.pop();
      const tb = tempStack.pop();

      if (!(typeof ta == "bigint" && typeof tb == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const a = BigInt.asIntN(256, ta);
      const b = BigInt.asIntN(256, tb);
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a > b) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x14: {
    name: 'EQ',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a == b) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x15: {
    name: 'ISZERO',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();

      if (!(typeof a == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, BigInt(a == 0n) ))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x16: {
    name: 'AND',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a & b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x17: {
    name: 'OR',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a | b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x18: {
    name: 'XOR',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();
      const b = tempStack.pop();

      if (!(typeof a == "bigint" && typeof b == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, a ^ b))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x19: {
    name: 'NOT',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const a = tempStack.pop();

      if (!(typeof a == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const newStack = tempStack.concat(BigInt.asUintN(256, ~a))
      return {
        stack: newStack,
        counter,
        continueExecution: true,
        error: null
      };
    },
  },

  0x1a: {
    name: 'BYTE',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const i = tempStack.pop();
      const x = tempStack.pop();

      if (!(typeof i == "bigint" && typeof x == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const hexString = x.toString(16).padStart(64, "0"); // ensures the stack input is 32-bytes (64 chars) long;
      const bytesArray = new Uint8Array(
        (hexString.match(/../g) || [])
        .map((byte) => parseInt(byte, 16))
      );

      const newStack = tempStack.concat(BigInt(bytesArray[Number(i)] || 0 ))
      return {
        stack: newStack,
        counter,
        continueExecution: false,
        error: null,
      }
    }
  },

  0x1b: {
    name: 'SHL',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const shift = tempStack.pop();
      const value = tempStack.pop();

      if (!(typeof shift == "bigint" && typeof value == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (shift > 255n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: false,
        error: null,
      }
      const newStack = tempStack.concat(BigInt.asUintN(256, value << shift))
      return {
        stack: newStack,
        counter,
        continueExecution: false,
        error: null,
      }
    }
  },

  0x1c: {
    name: 'SHR',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const shift = tempStack.pop();
      const value = tempStack.pop();

      if (!(typeof shift == "bigint" && typeof value == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      if (shift > 255n) return {
        stack: [ ...tempStack, 0n ],
        counter,
        continueExecution: false,
        error: null,
      }
      const newStack = tempStack.concat(BigInt.asUintN(256, value >> shift))
      return {
        stack: newStack,
        counter,
        continueExecution: false,
        error: null,
      }
    }
  },

  0x1d: {
    name: 'SAR',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      const tempStack = stack.map(s => s);
      const shift = tempStack.pop();
      const value = tempStack.pop();

      if (!(typeof shift == "bigint" && typeof value == "bigint")) return {
        stack: [],
        counter,
        continueExecution: false,
        error: "Stack underflow"
      };
      const isSigned = BigInt.asIntN(256, value) < 0;

      // the incoming bits are 0, which is the msb.
      if (!isSigned) return {
        stack: [ ...tempStack, value >> shift ],
        counter,
        continueExecution: false,
        error: null
      }

      if (shift > 256n) {
        // we could skip these constant cases as the normal operation would return the same result
        // but doing with these large values, we could run out of memory, especially in JS/TS
        return {
          stack: [ ...tempStack, BigInt.asUintN(256, MAX_UINT256) ], // all the bits will be replaced by 1 => max value;
          counter,
          continueExecution: false,
          error: null
        }
      }

      const temp = value >> shift
      // next convert the bits that just came in from 0 to 1.
      // A mask that enables `shift` number of bits.
      const mask = MAX_UINT256 << (256n - shift);

      return {
        stack: [ ...tempStack, BigInt.asUintN(256,  temp | mask) ],
        counter,
        continueExecution: false,
        error: null
      }
    }
  },


  //// STACK MANIPULATION
  0x50: {
    name: 'POP',
    minimumGas: 2,
    implementation: ({ stack, counter }) => ({
      counter: counter,
      stack: stack.slice(0, stack.length -1),
      error: null,
      continueExecution: true
    }),
  },

  0x58: {
    name: 'PC',
    minimumGas: 2,
    implementation: ({ counter, stack }) => ({
      stack: [ ...stack, BigInt.asUintN(256, BigInt(Math.floor(counter / 2) - 1)) ],
      counter: counter,
      continueExecution: true,
      error: null
    })
  },

  //// 0x5F - 0x7F: PUSH range.
  0x5F: {
    name: 'PUSH0',
    minimumGas: 2,
    implementation: ({ stack, counter }) => ({
      counter: counter,
      stack: [ ...stack, 0n ],
      error: null,
      continueExecution: true
    }),
  },
  0x60: {
    name: 'PUSH1',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(1 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x61: {
    name: 'PUSH2',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(2 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x62: {
    name: 'PUSH3',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(3 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x63: {
    name: 'PUSH4',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(4 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x64: {
    name: 'PUSH5',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(5 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x65: {
    name: 'PUSH6',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(6 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x66: {
    name: 'PUSH7',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(7 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x67: {
    name: 'PUSH8',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(8 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x68: {
    name: 'PUSH9',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(9 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x69: {
    name: 'PUSH10',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(10 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6a: {
    name: 'PUSH11',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(11 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6b: {
    name: 'PUSH12',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(12 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6c: {
    name: 'PUSH13',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(13 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6d: {
    name: 'PUSH14',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(14 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6e: {
    name: 'PUSH15',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(15 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x6f: {
    name: 'PUSH16',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(16 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x70: {
    name: 'PUSH17',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(17 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x71: {
    name: 'PUSH18',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(18 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x72: {
    name: 'PUSH19',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(19 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x73: {
    name: 'PUSH20',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(20 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x74: {
    name: 'PUSH21',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(21 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x75: {
    name: 'PUSH22',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(22 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x76: {
    name: 'PUSH23',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(23 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x77: {
    name: 'PUSH24',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(24 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x78: {
    name: 'PUSH25',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(25 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x79: {
    name: 'PUSH26',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(26 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7a: {
    name: 'PUSH27',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(27 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7b: {
    name: 'PUSH28',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(28 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7c: {
    name: 'PUSH29',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(29 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7d: {
    name: 'PUSH30',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(30 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7e: {
    name: 'PUSH31',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(31 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },
  0x7f: {
    name: 'PUSH32',
    minimumGas: 3,
    implementation: ({ bytecode, stack, counter }) => {
      const res = pushN(32 , counter, bytecode); 
      const newStack = stack.concat(res.value);
      return {
        counter: res.counter,
        stack: newStack,
        error: null,
        continueExecution: true
      }
    } 
  },

  //// 0x80 - 0x8f: DUP range
  0x80: {
    name: 'DUP1',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(1 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x81: {
    name: 'DUP2',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(2 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x82: {
    name: 'DUP3',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(3 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x83: {
    name: 'DUP4',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(4 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x84: {
    name: 'DUP5',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(5 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x85: {
    name: 'DUP6',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(6 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x86: {
    name: 'DUP7',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(7 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x87: {
    name: 'DUP8',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(8 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x88: {
    name: 'DUP9',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(9 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x89: {
    name: 'DUP10',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(10 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8a: {
    name: 'DUP11',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(11 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8b: {
    name: 'DUP12',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(12 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8c: {
    name: 'DUP13',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(13 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8d: {
    name: 'DUP14',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(14 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8e: {
    name: 'DUP15',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(15 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x8f: {
    name: 'DUP16',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const duppedValue = dupN(16 , stack);
        return {
          counter,
          continueExecution: true,
          stack: [ ...stack, duppedValue],
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },

  //// 0x90 - 0x9f: SWAP range
  0x90: {
    name: 'SWAP1',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(1, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x91: {
    name: 'SWAP2',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(2, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x92: {
    name: 'SWAP3',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(3, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x93: {
    name: 'SWAP4',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(4, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x94: {
    name: 'SWAP5',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(5, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x95: {
    name: 'SWAP6',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(6, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x96: {
    name: 'SWAP7',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(7, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x97: {
    name: 'SWAP8',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(8, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x98: {
    name: 'SWAP9',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(9, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x99: {
    name: 'SWAP10',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(10, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9a: {
    name: 'SWAP11',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(11, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9b: {
    name: 'SWAP12',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(12, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9c: {
    name: 'SWAP13',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(13, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9d: {
    name: 'SWAP14',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(14, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9e: {
    name: 'SWAP15',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(15, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },
  0x9f: {
    name: 'SWAP16',
    minimumGas: 3,
    implementation: ({ stack, counter }) => {
      try {
        const tempStack = stack.map(s => s);
        swapN(16, tempStack);
        return {
          counter,
          continueExecution: true,
          stack: tempStack,
          error: null
        }
      } catch {
        return {
          counter,
          continueExecution: false,
          stack: [ ...stack ],
          error: "Stack underflow"
        }
      }
    }
  },

  0xfe: {
    name: "INVALID",
    minimumGas: NaN,
    implementation: ({ stack, counter }) => {
      console.log("INVALID");
      return {
        counter,
        continueExecution: false,
        stack: [],
        error: "Stack underflow"
      }
    }
  }

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

function dupN(n: number, stack: readonly bigint[]): bigint {
  return stack[stack.length - n];
}

function swapN(n: number, stack: bigint[]) {
  const a = stack[stack.length - 1] as bigint;
  const b = stack[stack.length - 1 - n];

  stack.splice( stack.length - 1 - n, 1, a);
  stack.splice( stack.length - 1, 1, b);
}

function pushN(n: number, counter: number, bytecode: string) {
  const valueToBePushed = BigInt("0x" + bytecode.slice(counter, counter + n*2));
  counter += n*2;

  return {
    counter,
    value: valueToBePushed
  }
}
