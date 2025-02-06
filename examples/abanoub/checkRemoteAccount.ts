import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import { InfoAPI } from "../../src/apis/info"
import { OmegaVMAPI } from "../../src/apis/omegavm"
import { DELTAAPI } from "../../src/apis/delta"
import { ALPHAAPI } from "../../src/apis/alpha"
import { Defaults } from "../../src/utils"
import { Web3 } from "web3"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const key = process.env.PRIVATE_KEY ?? ""
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)

const privKey: Buffer = new Buffer(key, "hex")
const achain: ALPHAAPI = odyssey.AChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const aKeychain = achain.keyChain()
const oKeychain = ochain.keyChain()
const dKeychain = dchain.keyChain()

aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
const dkey = dKeychain.importKey(privKey)

const main = async (): Promise<any> => {
  const achainAddresses = await aKeychain.getAddressStrings()
  const dchainAddresses = await dKeychain.getAddressStrings()
  const ochainAddresses = await oKeychain.getAddressStrings()
  const dHexAddress = process.env.PUBLIC_KEY1 ?? ""

  console.log(`A Address(${achainAddresses[0]})\nD Address(${dHexAddress})\nO Address(${ochainAddresses[0]})`)

  const abalance = await achain.getBalance(achainAddresses[0], Defaults.network[networkID].A.dioneAssetID ?? "")
  const obalance = await ochain.getBalance(ochainAddresses)
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const dbalance = await web3.eth.getBalance(dHexAddress)
  const nonce = Number(txcount)
  
  console.log(`A Balance(${abalance.balance.toString()})\nD Balance(${dbalance.toString()})\nO Balance(${obalance.balance.toString()})`)

}

main()