interface VatCheckRequest {
  countryCode: string
  vatNumber: string
  useCache?: boolean
}

interface VatCheckApproxRequest extends VatCheckRequest {
  requesterCountryCode: string
  requesterVatNumber: string
}

interface VatCheckResponse {
  valid: boolean
  countryCode: string
  vatNumber: string
  requestDate: string
  name?: string
  address?: string
  error?: string
  errorCode?: string
  requestIdentifier?: string
}

interface ApiResponse {
  success: boolean
  data?: VatCheckResponse
  message?: string
}

export const useVatValidation = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check VAT number validity
   */
  const checkVat = async (request: VatCheckRequest): Promise<VatCheckResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse>('/api/vat/check', {
        method: 'POST',
        body: request
      })

      if (!response.success || !response.data) {
        error.value = response.data?.error || 'Failed to validate VAT number'
        return null
      }

      return response.data
    } catch (err: unknown) {
      let errorMessage = 'An error occurred'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as Record<string, unknown>).data as Record<string, unknown> | undefined
        errorMessage = (data?.message as string) || 'An error occurred'
      }
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Check VAT with requester information
   */
  const checkVatApprox = async (
    request: VatCheckApproxRequest
  ): Promise<VatCheckResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse>('/api/vat/check-approx', {
        method: 'POST',
        body: request
      })

      if (!response.success || !response.data) {
        error.value = response.data?.error || 'Failed to validate VAT number'
        return null
      }

      return response.data
    } catch (err: unknown) {
      let errorMessage = 'An error occurred'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as Record<string, unknown>).data as Record<string, unknown> | undefined
        errorMessage = (data?.message as string) || 'An error occurred'
      }
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear cache for specific VAT number
   */
  const clearCache = async (
    countryCode: string,
    vatNumber: string
  ): Promise<boolean> => {
    try {
      const response = await $fetch<ApiResponse>('/api/vat/cache', {
        method: 'DELETE',
        body: { countryCode, vatNumber }
      })

      return response.success
    } catch (err: unknown) {
      console.error('Failed to clear cache:', err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  /**
   * Clear all cache
   */
  const clearAllCache = async (): Promise<boolean> => {
    try {
      const response = await $fetch<ApiResponse>('/api/vat/cache/clear-all', {
        method: 'DELETE'
      })

      return response.success
    } catch (err: unknown) {
      console.error('Failed to clear all cache:', err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    checkVat,
    checkVatApprox,
    clearCache,
    clearAllCache
  }
}
