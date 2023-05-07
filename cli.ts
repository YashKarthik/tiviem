import { evm } from "./bytecode-parser";
import { hexStringToUint8Array } from "./opcodes";

// @ts-ignore
const args = process.argv.slice(2);

let code = '';
let gas = 15_000_000;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--code':
    case '-c':
      code = args[i + 1];
      i++; // Skip the next argument
      break;
    case '--gas':
    case '-g':
      try {
        gas = parseInt(args[i + 1].replace(/_/g, ''), 10);
        i++; // Skip the next argument
      } catch {
        console.log("Invalid argument for gas.");
      }
      break;
    default:
      console.log(`Unknown argument: ${args[i]}`);
      break;
  }
}

evm(hexStringToUint8Array(code), gas);
