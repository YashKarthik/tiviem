import { AccountState, Context, evm } from "./bytecode-parser";
import { hexStringToUint8Array } from "./opcodes";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

type Transaction = {
  from?: string,
  to?: string,
  value?: number,
  gasLeft?: number
}

const t = await yargs(hideBin(process.argv))
  .option("verbose", {
    alias: "v",
    describe: "output the trace of each of the operations",
    choices: [0, 1, 2, 3],
    default: 1
  })
  .option("code", {
    alias: "c",
    describe: "the bytecode to run",
    type: "string",
    coerce: (codeString: string) => {
      if (codeString.slice(0, 2) == "0x") return hexStringToUint8Array(codeString.slice(2,));
      return hexStringToUint8Array(codeString);
    },
  })
  .option("tx", {
    describe: "Transaction details",
    coerce: (tx: Transaction) => tx,
  })
  .demandOption("code")
  .argv;


const CONTRACT_ADDRESS = BigInt(t?.tx?.to || 0xee);

const worldState = new Map<bigint, AccountState>();
worldState.set(CONTRACT_ADDRESS, {
  balance: worldState.get(CONTRACT_ADDRESS)?.balance || 0n,
  code: {
    bin: t.code
  },
  storage: new Map<bigint, bigint>(),
  nonce: 0n
});

const context: Context = {
  address: CONTRACT_ADDRESS,
  caller: BigInt(t?.tx?.from || 0x00),
  origin: BigInt(t?.tx?.from || 0x00),

  gasPrice: 1n,
  gasLeft: t?.tx?.gasLeft || 15_000_000,
  isStatic: false,

  callValue: BigInt(t.tx?.value || 0),
  callData: new Uint8Array(0),

  bytecode: t.code,

  block: {
    basefee: BigInt(0n),
    coinbase: BigInt(0n),
    timestamp: BigInt(0n),
    number: BigInt(0n),
    difficulty: BigInt(0n),
    gasLimit: BigInt(0n),
    chainId: BigInt(1n),
  },
  state: worldState,

}

evm(context, t.verbose);
