<template>
  <div class="max-w-sm mx-auto my-16 px-4">
    <UCard>
      <template #header>
        <h2>EU VAT Number Validator</h2>
      </template>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <UFormField
          label="Country"
          required
        >
          <CountryPicker
            v-model="formData.country"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-model="formData.vatNumber"
          label="VAT Number"
          description="Enter without country prefix (e.g., 123456789 for DE123456789)"
          required
        >
          <UInput
            v-model="formData.vatNumber"
            type="text"
            class="w-full"
            placeholder="Enter VAT number (without country code)"
            maxlength="15"
            required
          />
        </UFormField>

        <UCheckbox
          v-model="formData.useCache"
          label="Use cache"
        />

        <UButton
          type="submit"
          block
          size="xl"
          :disabled="loading"
        >
          <span v-if="loading">Validating...</span>
          <span v-else>Validate VAT</span>
        </UButton>
      </form>

      <!-- Error message -->
      <UAlert
        v-if="error"
        color="error"
        :title="error"
      />

      <!-- Result -->
      <div v-if="result">
        <div v-if="result.valid">
          <h3>✓ Valid VAT Number</h3>
          <div>
            <p><strong>Country:</strong> {{ result.countryCode }}</p>
            <p><strong>VAT Number:</strong> {{ result.vatNumber }}</p>
            <p><strong>Request Date:</strong> {{ result.requestDate }}</p>
            <p v-if="result.name">
              <strong>Company Name:</strong> {{ result.name }}
            </p>
            <p v-if="result.address">
              <strong>Address:</strong> {{ result.address }}
            </p>
          </div>
        </div>

        <div v-else>
          <h3>✗ Invalid VAT Number</h3>
          <p v-if="result.error">
            {{ result.error }}
          </p>
          <p v-if="result.errorCode">
            <strong>Error Code:</strong> {{ result.errorCode }}
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type Country = {
  code: string
  name?: string
}

const { loading, error, checkVat } = useVatValidation()

const formData = ref<{
  country?: Country | undefined
  vatNumber: string
  useCache: boolean
}>({
  country: undefined,
  vatNumber: '',
  useCache: true
})

const result = ref<any>(null)

const handleSubmit = async () => {
  result.value = null

  const response = await checkVat({
    countryCode: formData.value.country?.code || '',
    vatNumber: formData.value.vatNumber,
    useCache: formData.value.useCache
  })

  if (response) {
    result.value = response
  }
}
</script>
