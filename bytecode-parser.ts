import { instructions } from "./opcodes";

try {
  const bytecode = process.argv.slice(2,)[0].slice(2,); // the first slice gets us the passed cmd-line arg, the second slice is to get rid of the 0x
  if (!bytecode) console.log("No bytecode given.");
  evm(bytecode);
} catch {

}

export function evm(bytecode:string) {

  const stack: bigint[] = [];

  for (let counter = 0; counter < bytecode.length; ) {
    console.log(bytecode.slice(0, counter) + "🔺" + bytecode.slice(counter,));
    console.log("Stack:", stack, "\n");

    const opcode = parseInt("0x" + bytecode.slice(counter, counter + 2)) as keyof typeof instructions;
    if (isNaN(opcode)) {
      console.log(`Invalid opcode ${opcode}`);
      return { success: false, stack: stack };
    }
    counter += 2;

    if (opcode == 0x00) return { success: true, stack: stack.reverse() };
    if (opcode >= 0x5F && opcode <= 0x7F) { // PUSH range
      if (opcode == 0x5F) { // PUSH0, does not read args from bytecode;
        const result = instructions[opcode].implementation();
        stack.push(...result);
        continue;
      }

      const numberOfArgs = parseInt(instructions[opcode].name.slice(4,)); // we get the number of bytes, to be read, from name; eg: PUSH1 => 1 byte
      const pushArgs = BigInt("0x" + bytecode.slice(counter, counter+numberOfArgs*2)); // We read numberOfArgs bytes from the bytocode; *2 as each byte = 2 characters in hex
      counter += numberOfArgs*2; // *2 cuz above

      console.log("0x" + opcode.toString(16), instructions[opcode].name, pushArgs);

      if (stack.length == 1024) {
        console.log("Stack overflow");
        return { success: false, stack: stack };
      }

      stack.push(pushArgs);
      continue;
    }

    // @ts-expect-error This section runs only when out of PUSH range.
    const stackInputLength = instructions[opcode].implementation.length; // read these many words from stack
    const stackInput: bigint[] = [];
    for (let inputNum = 0; inputNum < stackInputLength; inputNum++) {
      const input = stack.pop();
      if (input == undefined) {
        console.log("Stack underflow.");
        return { success: false, stack: stack };
      }

      stackInput.push(input);
    }

    console.log("0x" + opcode, instructions[opcode].name, stackInput);

    // @ts-expect-error This section runs only when out of PUSH range.
    const result = instructions[opcode].implementation(...(stackInput as [bigint, bigint]));
    stack.push(...result);
  }

  console.log("Final stack:", stack.map(s => "0x" + s.toString(16)));
  return { success: true, stack: stack.reverse() };
}
