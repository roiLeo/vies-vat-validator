export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.countryCode || !body.vatNumber) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: {
            countryCode: !body.countryCode ? ['Country code is required'] : [],
            vatNumber: !body.vatNumber ? ['VAT number is required'] : []
          }
        }
      })
    }

    if (!/^[A-Z]{2}$/i.test(body.countryCode)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: {
            countryCode: ['Country code must be 2 letters']
          }
        }
      })
    }

    if (body.vatNumber.length > 15) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: {
            vatNumber: ['VAT number is too long (max 15 characters)']
          }
        }
      })
    }

    const useCache = body.useCache !== false

    const result = await viesVatService.checkVat(
      body.countryCode,
      body.vatNumber,
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
