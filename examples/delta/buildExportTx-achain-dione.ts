import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { Web3 } from "web3"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costExportTx
} from "../../src/utils"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const dchain: DELTAAPI = odyssey.DChain()
const privKey: Buffer = new Buffer("7b0bb24b8d95ae393c95ef59d8704b22de7a85016dae49116fc24da5033c7d9d", "hex")
const aKeychain: ALPHAKeyChain = achain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()
aKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID ?? ""
const dHexAddress: string = "0x7C6689B86B66c462a6F668Ac99Aa9CBf7bfE9fAf"
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce = Number(txcount)
  const locktime: BN = new BN(0)
  let dioneAmount: BN = new BN(1e11)
  let fee: BN = baseFee

  let unsignedTx: UnsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    aChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    aAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`A chain address: ${aAddressStrings}`)
  console.log(`Success! TXID: ${txid}`)
}

main()
