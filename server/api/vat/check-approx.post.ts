export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const requiredFields = [
      'countryCode',
      'vatNumber',
      'requesterCountryCode',
      'requesterVatNumber'
    ]

    const errors: Record<string, string[]> = {}

    requiredFields.forEach((field) => {
      if (!body[field]) {
        errors[field] = [`${field} is required`]
      }
    })

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: { errors }
      })
    }

    if (!/^[A-Z]{2}$/i.test(body.countryCode)) {
      errors.countryCode = ['Country code must be 2 letters']
    }
    if (!/^[A-Z]{2}$/i.test(body.requesterCountryCode)) {
      errors.requesterCountryCode = ['Requester country code must be 2 letters']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: { errors }
      })
    }

    const useCache = body.useCache !== false

    const result = await viesVatService.checkVatApprox(
      body.countryCode,
      body.vatNumber,
      body.requesterCountryCode,
      body.requesterVatNumber,
      useCache
    )

    return {
      success: !result.error,
      data: result
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while checking VAT'
      }
    })
  }
})
