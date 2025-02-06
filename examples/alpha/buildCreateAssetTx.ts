import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  InitialStates,
  SECPMintOutput,
  SECPTransferOutput
} from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import {
  DefaultLocalGenesisPrivateKey
} from "../../src/utils"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const privKey: Buffer = new Buffer("7b0bb24b8d95ae393c95ef59d8704b22de7a85016dae49116fc24da5033c7d9d", "hex")
aKeychain.importKey(privKey)
const aAddresses: Buffer[] = achain.keyChain().getAddresses()
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const outputs: SECPMintOutput[] = []
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildCreateAssetTx to create an ANT"
)
const name: string = "AbanoubToken"
const symbol: string = "ABAN"
const denomination: number = 3

console.log('-----')
const main = async (): Promise<any> => {

  console.log('-----')
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos

  console.log('-----')
  const amount: BN = new BN(507)
  const vcapSecpOutput = new SECPTransferOutput(
    amount,
    aAddresses,
    locktime,
    threshold
  )
  const initialStates: InitialStates = new InitialStates()
  initialStates.addOutput(vcapSecpOutput as any)

  const secpMintOutput: SECPMintOutput = new SECPMintOutput(
    aAddresses,
    locktime,
    threshold
  )
  outputs.push(secpMintOutput)

  console.log('-----')
  const unsignedTx: UnsignedTx = await achain.buildCreateAssetTx(
    utxoSet,
    aAddressStrings,
    aAddressStrings,
    initialStates,
    name,
    symbol,
    denomination,
    outputs,
    memo
  )
  console.log('-----')
  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
