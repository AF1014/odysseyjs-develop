import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  ALPHAAPI,
  KeyChain as ALPHAKeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/alpha"
import {
  GetBalanceResponse,
  GetUTXOsResponse
} from "../../src/apis/alpha/interfaces"
import { KeyChain as OmegaVMKeyChain, OmegaVMAPI } from "../../src/apis/omegavm"
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
const ochain: OmegaVMAPI = odyssey.OChain()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const oKeychain: OmegaVMKeyChain = ochain.keyChain()
const key = ""
const privKey: Buffer = new Buffer(key, "hex")
aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from(
  "ALPHA utility method buildExportTx to export DIONE to the O-Chain from the A-Chain"
)
const fee: BN = achain.getDefaultTxFee()

const main = async (): Promise<any> => {
  const alphaUTXOResponse: GetUTXOsResponse = await achain.getUTXOs(
    aAddressStrings
  )
  const utxoSet: UTXOSet = alphaUTXOResponse.utxos
  const getBalanceResponse: GetBalanceResponse = await achain.getBalance(
    aAddressStrings[0],
    dioneAssetID
  )
  const balance: BN = new BN(getBalanceResponse.balance)
  // const amount: BN = balance.sub(fee)
  const amount: BN = new BN(100000000000)

  const unsignedTx: UnsignedTx = await achain.buildExportTx(
    utxoSet,
    amount,
    oChainBlockchainID,
    oAddressStrings,
    aAddressStrings,
    aAddressStrings,
    memo,
    asOf,
    locktime
  )

  const tx: Tx = unsignedTx.sign(aKeychain)
  const txid: string = await achain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
