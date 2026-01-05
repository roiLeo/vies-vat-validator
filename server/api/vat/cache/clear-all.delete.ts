export default defineEventHandler(async (_event) => {
  try {
    viesVatService.clearAllCache()

    return {
      success: true,
      message: 'All cache cleared successfully'
    }
  } catch (error: unknown) {
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
