import { Context, evm } from "./bytecode-parser";
import { hexStringToUint8Array } from "./opcodes";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const t = yargs(hideBin(process.argv))
  .option("verbose", {
    alias: "v",
    describe: "output the trace of each of the operations",
    choices: [0, 1, 2, 3]
  })
  .argv;

console.log(t);
