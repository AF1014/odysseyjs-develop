import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import {
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"
import { log } from "console"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
// const privKey: Buffer = new Buffer(DefaultLocalGenesisPrivateKey, "hex")
const privKey: Buffer = new Buffer("7b0bb24b8d95ae393c95ef59d8704b22de7a85016dae49116fc24da5033c7d9d", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)

const reward = "O-testnet1r86v49tyxa05zpfwa3pj896mv0w5mdtcdzxx34"
const nodeID: string = "NodeID-67nS6ebQNYfkU7QidZkcqzZPft4Qrnnob"

const asOf: BN = UnixNow()
const startTime: BN = UnixNow().add(new BN(60 * 1))
console.log("startTime: ", startTime)
const endTime: BN = startTime.add(new BN(60 * 60 * 24 * 365))
console.log("endTime: ", endTime)
const delegationFee: number = 10

const main = async (): Promise<any> => {
  const stakeAmount: any = await ochain.getMinStake()
  console.log("stakeAmount: ", stakeAmount);
  
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  console.log("utxos:", oAddressStrings)
  console.log("utxos:", utxoSet.getAllUTXOs())
  // Log Minimum Validator Stake
console.log("Minimum Validator Stake: ", stakeAmount.minValidatorStake.toString())

const unsignedTx: UnsignedTx = await ochain.buildAddValidatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    stakeAmount.minValidatorStake,
    [reward],
    delegationFee,
    locktime,
    threshold,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main().catch((e) => console.log(e))
