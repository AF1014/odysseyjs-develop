import "dotenv/config"
import { Odyssey } from "../../src"
import { AdminAPI } from "../../src/apis/admin"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const admin: AdminAPI = odyssey.Admin()

const main = async (): Promise<any> => {
  const successful: boolean = await admin.stopCPUProfiler()
  console.log(successful)
}

main()
