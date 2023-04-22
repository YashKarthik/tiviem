import { instructions } from "./opcodes";

const bytecode = process.argv.slice(2,)[0].slice(2,); // the first slice gets us the passed cmd-line arg, the second slice is to get rid of the 0x
if (!bytecode) throw new Error("No bytecode given.");


// 60 01, 60 02, 01

for (let counter = 0; counter < bytecode.length; ) {
  const opcode = bytecode.slice(counter, counter + 2);
  counter += 2;
  
  if (opcode.slice(0, 4) == "PUSH") {
    const argumentsFromBytecodeLength = parseInt(opcode.slice(4,)); // read these number of bytes directly off the bytecode
    const input = bytecode.slice(counter, counter+argumentsFromBytecodeLength*2); // *2 as each byte = 2 characters in hex
    // append to stack
  }

  const stackInputLength = instructions[opcode].implementation.length; // read these many words from stack
  const stackInput = bytecode.slice(counter, stackInputLength); // stackInputLength*2 as each arg would be one byte => 2 characters in hex

  // perform operation with args
}
