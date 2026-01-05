<template>
  <div class="max-w-sm mx-auto my-16 px-4">
    <UCard variant="subtle">
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
          label="VAT Number"
          description="Enter without country prefix (e.g., 123456789 for DE123456789)"
          required
        >
          <UInput
            v-model="formData.vatNumber"
            placeholder="Enter VAT number"
            :maxlength="15"
            required
            class="w-full"
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <div
                class="text-xs text-muted tabular-nums"
                aria-live="polite"
                role="status"
              >
                {{ formData.vatNumber?.length }}/{{ 15 }}
              </div>
            </template>
          </UInput>
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
        class="mt-4"
        color="error"
        variant="subtle"
        icon="i-lucide-badge-alert"
        :title="error"
      />

      <!-- Result -->
      <div
        v-if="result"
        class="mt-4"
      >
        <div v-if="result.valid">
          <UAlert
            variant="subtle"
            title="Valid VAT Number"
            description="The provided VAT number is valid according to the VIES service."
            icon="i-lucide-badge-check"
          />

          <dl class="mt-4 space-y-2">
            <div v-if="result.name">
              <dt class="text-sm text-muted font-medium">
                Company Name
              </dt>
              <dd>{{ result.name }}</dd>
            </div>

            <div>
              <dt class="text-sm text-muted font-medium">
                Country Code
              </dt>
              <dd>{{ result.countryCode }}</dd>
            </div>

            <div>
              <dt class="text-sm text-muted font-medium">
                VAT Number
              </dt>
              <dd>{{ result.vatNumber }}</dd>
            </div>

            <div v-if="result.address">
              <dt class="text-sm text-muted font-medium">
                Address
              </dt>
              <dd>{{ result.address }}</dd>
            </div>

            <div v-if="result.requestDate">
              <dt>Request Date</dt>
              <dd>{{ result.requestDate }}</dd>
            </div>
          </dl>
        </div>

        <div v-else>
          <UAlert
            color="error"
            variant="subtle"
            title="Invalid VAT Number"
            description="The provided VAT number is invalid according to the VIES service."
            icon="i-lucide-badge-alert"
          />
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

type VatValidationResult = {
  valid: boolean
  countryCode: string
  vatNumber: string
  requestDate: string
  name?: string
  address?: string
  error?: string
  errorCode?: string
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

const result = ref<VatValidationResult | null>(null)

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
