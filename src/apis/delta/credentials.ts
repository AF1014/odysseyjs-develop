/**
 * @packageDocumentation
 * @module API-DELTA-Credentials
 */

import { DELTAConstants } from "./constants"
import { Credential } from "../../common/credentials"
import { CredIdError } from "../../utils/errors"

/**
 * Takes a buffer representing the credential and returns the proper [[Credential]] instance.
 *
 * @param credid A number representing the credential ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Credential]]-extended class.
 */
export const SelectCredentialClass = (
  credid: number,
  ...args: any[]
): Credential => {
  if (credid === DELTAConstants.SECPCREDENTIAL) {
    return new SECPCredential(...args)
  }
  /* istanbul ignore next */
  throw new CredIdError("Error - SelectCredentialClass: unknown credid")
}

export class SECPCredential extends Credential {
  protected _typeName: string = "SECPCredential"
  protected _typeID: number = DELTAConstants.SECPCREDENTIAL

  //serialize and deserialize both are inherited

  getCredentialID(): number {
    return this._typeID
  }

  clone(): this {
    let newbase: SECPCredential = new SECPCredential()
    newbase.fromBuffer(this.toBuffer())
    return newbase as this
  }

  create(...args: any[]): this {
    return new SECPCredential(...args) as this
  }

  select(id: number, ...args: any[]): Credential {
    let credential: Credential = SelectCredentialClass(id, ...args)
    return credential
  }
}
