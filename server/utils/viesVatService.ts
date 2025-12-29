import { type Client, createClientAsync } from 'soap'

interface VatCheckResponse {
  valid: boolean
  countryCode: string
  vatNumber: string
  requestDate: string
  name?: string
  address?: string
  error?: string
  errorCode?: string
}

interface VatCheckApproxResponse extends VatCheckResponse {
  requestIdentifier?: string
}

interface CachedVatData {
  data: VatCheckResponse | VatCheckApproxResponse
  timestamp: number
}

class ViesVatService {
  private wsdlUrl = 'https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl'
  private client: Client | null = null
  private cacheTtl = 86400000 // 24 hours in milliseconds
  private cache = new Map<string, CachedVatData>()

  /**
   * Initialize SOAP client
   */
  private async getClient(): Promise<Client> {
    if (this.client === null) {
      try {
        this.client = await createClientAsync(this.wsdlUrl, {
          endpoint: 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService'
        })
      } catch (error: any) {
        console.error('VIES SOAP Client initialization failed:', error.message)
        throw new Error('Failed to initialize VIES service')
      }
    }
    return this.client
  }

  /**
   * Check VAT number validity
   */
  async checkVat(
    countryCode: string,
    vatNumber: string,
    useCache = true
  ): Promise<VatCheckResponse> {
    countryCode = countryCode.toUpperCase().trim()
    vatNumber = vatNumber.replace(/[^A-Za-z0-9]/g, '')

    const cacheKey = `vies_vat_${countryCode}_${vatNumber}`

    // Check cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as VatCheckResponse
      }
    }

    try {
      const client = await this.getClient()
      const [result] = await client.checkVatAsync({
        countryCode,
        vatNumber
      })

      const response: VatCheckResponse = {
        valid: result.valid || false,
        countryCode,
        vatNumber,
        requestDate: result.requestDate || new Date().toISOString().split('T')[0],
        name: result.name || undefined,
        address: result.address || undefined
      }

      // Cache valid results
      if (useCache && response.valid) {
        this.setCache(cacheKey, response)
      }

      return response
    } catch (error: any) {
      console.error('VIES VAT check failed:', {
        countryCode,
        vatNumber,
        error: error.message
      })

      return {
        valid: false,
        countryCode,
        vatNumber,
        requestDate: new Date().toISOString() as string,
        error: this.parseSoapError(error),
        errorCode: error.root?.Envelope?.Body?.Fault?.faultcode || 'UNKNOWN'
      }
    }
  }

  /**
   * Check VAT with requester information
   */
  async checkVatApprox(
    countryCode: string,
    vatNumber: string,
    requesterCountryCode: string,
    requesterVatNumber: string,
    useCache = true
  ): Promise<VatCheckApproxResponse> {
    countryCode = countryCode.toUpperCase().trim()
    vatNumber = vatNumber.replace(/[^A-Za-z0-9]/g, '')
    requesterCountryCode = requesterCountryCode.toUpperCase().trim()
    requesterVatNumber = requesterVatNumber.replace(/[^A-Za-z0-9]/g, '')

    const cacheKey = `vies_vat_approx_${countryCode}_${vatNumber}_${requesterCountryCode}_${requesterVatNumber}`

    // Check cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as VatCheckApproxResponse
      }
    }

    try {
      const client = await this.getClient()
      const [result] = await client.checkVatApproxAsync({
        countryCode,
        vatNumber,
        requesterCountryCode,
        requesterVatNumber
      })

      const response: VatCheckApproxResponse = {
        valid: result.valid || false,
        countryCode,
        vatNumber,
        requestDate: result.requestDate || new Date().toISOString().split('T')[0],
        name: result.traderName || undefined,
        address: result.traderAddress || undefined,
        requestIdentifier: result.requestIdentifier || undefined
      }

      // Cache valid results
      if (useCache && response.valid) {
        this.setCache(cacheKey, response)
      }

      return response
    } catch (error: any) {
      console.error('VIES VAT approx check failed:', {
        countryCode,
        vatNumber,
        error: error.message
      })

      return {
        valid: false,
        countryCode,
        vatNumber,
        requestDate: new Date().toISOString() as string,
        error: this.parseSoapError(error),
        errorCode: error.root?.Envelope?.Body?.Fault?.faultcode || 'UNKNOWN'
      }
    }
  }

  /**
   * Parse SOAP error messages
   */
  private parseSoapError(error: any): string {
    const faultCode = error.root?.Envelope?.Body?.Fault?.faultcode || ''
    const faultString = error.root?.Envelope?.Body?.Fault?.faultstring || error.message

    const errorMessages: Record<string, string> = {
      INVALID_INPUT: 'Invalid country code or VAT number format',
      SERVICE_UNAVAILABLE: 'VIES service is temporarily unavailable',
      MS_UNAVAILABLE: 'Member state service is unavailable',
      TIMEOUT: 'Request timeout - service took too long to respond',
      SERVER_BUSY: 'Server is busy, please try again later'
    }

    for (const [code, message] of Object.entries(errorMessages)) {
      if (faultCode.includes(code) || faultString.includes(code)) {
        return message
      }
    }

    return faultString || 'An unknown error occurred'
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): VatCheckResponse | VatCheckApproxResponse | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.cacheTtl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: VatCheckResponse | VatCheckApproxResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear cache for specific VAT number
   */
  clearCache(countryCode: string, vatNumber: string): boolean {
    countryCode = countryCode.toUpperCase().trim()
    vatNumber = vatNumber.replace(/[^A-Za-z0-9]/g, '')
    const cacheKey = `vies_vat_${countryCode}_${vatNumber}`
    return this.cache.delete(cacheKey)
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear()
  }

  /**
   * Set cache TTL in milliseconds
   */
  setCacheTtl(milliseconds: number): this {
    this.cacheTtl = milliseconds
    return this
  }
}

// Export singleton instance
export const viesVatService = new ViesVatService()
