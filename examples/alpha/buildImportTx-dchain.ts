import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/alpha"
import { GetUTXOsResponse } from "../../src/apis/alpha/interfaces"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const aKeychain: KeyChain = achain.keyChain()
const key = "7b0bb24b8d95ae393c95ef59d8704b22de7a85016dae49116fc24da5033c7d9d"
const privKey: Buffer = new Buffer(key, "hex")
aKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
const threshold: number = 1
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildImportTx to import DIONE to the A-Chain from the D-Chain"
)

console.log("--initialized--");
const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings,
    dChainBlockchainID
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await achain.buildImportTx(
    utxoSet,
    aAddressStrings,
    dChainBlockchainID,
    aAddressStrings,
    aAddressStrings,
    aAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )
  console.log("--signing--")
  const tx: Tx = unsignedTx.sign(aKeychain)
  console.log('--issueing--')
  const txid: string = await achain.issueTx(tx)
  console.log(`A chain address: ${aAddressStrings}`)
  console.log(`Success! TXID: ${txid}`)
}

main().then(r => console.log("---")).catch(e => console.error(e))
