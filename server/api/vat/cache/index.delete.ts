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

    const cleared = viesVatService.clearCache(body.countryCode, body.vatNumber)

    return {
      success: true,
      message: cleared ? 'Cache cleared successfully' : 'No cache found'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while clearing cache'
      }
    })
  }
})
