import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain as OmegaKeyChain
} from "../../src/apis/omegavm"
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
import Web3  from "web3"
const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const key = "56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"
const privKey: Buffer = new Buffer(key, "hex")
const oKeychain: OmegaKeyChain = ochain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()
oKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
console.log(oAddressStrings)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainIdStr: string = Defaults.network[networkID].O.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dHexAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
// const  Web3  = require("web3")
const path: string = "/ext/bc/D/rpc"
const web3: any = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

console.log("ochainid--", ochain.getBlockchainID());
console.log("dchainid--", dchain.getBlockchainID());
console.log("default ochainid--", oChainBlockchainIdStr);

const main = async (): Promise<any> => {

  try{
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = Number(txcount)
  const locktime: BN = new BN(0)
  let dioneAmount: BN = new BN(500000000000000)
  let fee: BN = baseFee.div(new BN(1e9))
  fee = fee.add(new BN(1))

  let unsignedTx: UnsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    oChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    oAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )
  const exportCost: number = costExportTx(unsignedTx)
  fee = fee.mul(new BN(exportCost))

  unsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    oChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    oAddressStrings,
    nonce,
    locktime,
    threshold,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
} catch(error){
  console.error("Error: ", error)
}
}

main()
