type txReceipt = any

export interface IRegistryInstance {
  getClaim: (
    subject: string,
    issuer: string,
    id: string,
    key: string
  ) => txReceipt
  setClaim: {
    (
      subject: string,
      issuer: string,
      id: string,
      key: string,
      data: string,
      options?: {
        from?: string
        gas?: number
      }
    ): txReceipt
    estimateGas: (
      subject: string,
      issuer: string,
      id: string,
      key: string,
      data: string,
      options?: {
        from?: string
        gas?: number
      }
    ) => number
  }
  amendClaim: {
    (
      subject: string,
      newIssuer: string,
      oldIssuer: string,
      id: string,
      key: string,
      options?: {
        from?: string
        gas?: number
      }
    ): txReceipt
    estimateGas: (
      subject: string,
      newIssuer: string,
      oldIssuer: string,
      id: string,
      key: string,
      options?: {
        from?: string
        gas?: number
      }
    ) => number
  }
  removeClaim: {
    (
      subject: string,
      issuer: string,
      id: string,
      key: string,
      options?: {
        from?: string
        gas?: number
      }
    ): txReceipt
    estimateGas: (
      subject: string,
      issuer: string,
      id: string,
      key: string,
      options?: {
        from?: string
        gas?: number
      }
    ) => number
    ClaimSet: any // TODO: further types
    ClaimRemoved: any
    getClaim: any
  }
}
