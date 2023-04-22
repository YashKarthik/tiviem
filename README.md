# tiviem

A rudimentary implementation of EVM in Typescript /ti:vi:εm/. Built during [Nigts & Weekends S3](https://buildspace.so/).


I'm still figuring this out, help is appreciated!

## Plan
I've read a decent amount about how EVM works under the hood. I understand stack-based-machines and the different data locations.

Here's my plan for building this:
- Write a basic bytecode parser/de-compiler for the basic opcodes. It will take in the supplied bytecode(and any args) and print out the operations it would perform on it.
- Now that my program understands bytecode and what the different opcodes are supposed to do, I'll get on with implementing the operations for each opcode. While I do this, I'll also have to setup the different data locations and let the program interact with memory / storage based on the opcode.
- After this I guess I'll work on the gas mechanism that will prevent infinite loops and network spam.

## Development
Clone repo and install dependencies using:

```bash
bun install
```

To run:

```bash
bun run main.ts
```

This project was created using `bun init` in bun v0.5.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
