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
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : 'An error occurred while clearing cache'
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: errorMessage
      }
    })
  }
})
