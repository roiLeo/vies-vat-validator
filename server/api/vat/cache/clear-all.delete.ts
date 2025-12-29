export default defineEventHandler(async (event) => {
  try {
    viesVatService.clearAllCache()

    return {
      success: true,
      message: 'All cache cleared successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while clearing cache'
      }
    })
  }
})
