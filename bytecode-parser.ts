import { instructions } from "./opcodes";

const bytecode = process.argv.slice(2,)[0].slice(2,); // the first slice gets us the passed cmd-line arg, the second slice is to get rid of the 0x
if (!bytecode) throw new Error("No bytecode given.");


const stack: bigint[] = [];

for (let counter = 0; counter < bytecode.length; ) {
  console.log("Stack:", stack, "\n");
  const opcode = parseInt("0x" + bytecode.slice(counter, counter + 2)) as keyof typeof instructions;
  if (!opcode) throw new Error(`Invalid OPCODE: ${opcode}`);
  counter += 2;

  if (opcode >= 0x5F && opcode <= 0x7F) { // PUSH range
    const numberOfArgs = parseInt(instructions[opcode].name.slice(4,)); // we get the number of bytes, to be read, from name; eg: PUSH1 => 1 byte
    const pushArgs = BigInt("0x" + bytecode.slice(counter, counter+numberOfArgs*2)); // *2 as each byte = 2 characters in hex
    counter += numberOfArgs*2; // *2 cuz above

    console.log("0x" + opcode, instructions[opcode].name, pushArgs);
    if (stack.length == 1024) throw new Error("Maximum call stack exceeded.");

    stack.push(pushArgs);
    continue;
  }

  const stackInputLength = instructions[opcode].implementation.length; // read these many words from stack
  const stackInput: bigint[] = [];
  for (let inputNum = 0; inputNum < stackInputLength; inputNum++) {
    const input = stack.pop();
    if (!input) throw new Error("Call stack underflow");

    stackInput.push(input);
  }

  counter += stackInputLength;
  console.log("0x" + opcode, instructions[opcode].name, stackInput);

  const result = instructions[opcode].implementation(...(stackInput as [bigint, bigint]));
  stack.push(...result);
}

console.log("Final stack:", stack);
console.log(stack[0].toString(16));
