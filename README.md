# VIES VAT Validator

A modern web application for validating European VAT numbers using the official EU VIES (VAT Information Exchange System) service.

## Overview

VIES VAT Validator is a Nuxt application that provides a user-friendly interface for checking the validity of VAT numbers across the European Union. It integrates with the official European Commission VIES service via SOAP API to verify VAT numbers in real-time.

## Features

- **VAT Number Validation**: Verify VAT numbers across all EU member states
- **Country Selection**: Easy country picker with support for all EU countries
- **Dual Validation Modes**:
  - Standard validation: Check VAT number validity
  - Approximate matching: Check VAT with requester information for more detailed results
- **Business Information**: Retrieve company name and address when available
- **Caching**: Built-in 24-hour cache to reduce API calls and improve performance
- **Cache Management**: Clear cached entries or all cache at once
- **Dark Mode**: Full dark mode support via Nuxt UI
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript support with strict mode enabled
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Framework**: [Nuxt](https://nuxt.com) - Vue 3 meta-framework
- **UI Components**: [Nuxt UI](https://ui.nuxt.com) - Fully styled and customizable components
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **SOAP Client**: [node-soap](https://github.com/vpulim/node-soap) - SOAP client for Node.js
- **Icons**: [Iconify](https://iconify.design) - Icon library with Lucide and Simple Icons
- **Language**: TypeScript with strict mode
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 10.26+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/roiLeo/vies-vat-validator.git
cd vies-vat-validator
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building

Build the application for production:
```bash
pnpm build
```

Preview the built application:
```bash
pnpm preview
```

## API Endpoints

### Check VAT Number
**POST** `/api/vat/check`

Validates a VAT number using the VIES service.

Request body:
```json
{
  "countryCode": "FR",
  "vatNumber": "40303265045",
  "useCache": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "countryCode": "FR",
    "vatNumber": "40303265045",
    "requestDate": "2025-01-05",
    "name": "Company Name",
    "address": "Company Address"
  }
}
```

### Check VAT with Requester Info
**POST** `/api/vat/check-approx`

Validates a VAT number with additional requester information for more detailed results.

Request body:
```json
{
  "countryCode": "FR",
  "vatNumber": "40303265045",
  "requesterCountryCode": "DE",
  "requesterVatNumber": "12345678901",
  "useCache": true
}
```

### Clear Cache for VAT Number
**DELETE** `/api/vat/cache`

Clears the cached entry for a specific VAT number.

Request body:
```json
{
  "countryCode": "FR",
  "vatNumber": "40303265045"
}
```

### Clear All Cache
**DELETE** `/api/vat/cache/clear-all`

Clears all cached VAT validation entries.

## Configuration

The application uses Nuxt's runtime config for VIES service configuration:

```typescript
runtimeConfig: {
  viesWsdlUrl: 'https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl',
  public: {
    apiBase: '/api'
  }
}
```

## Caching

The application implements a built-in caching mechanism with the following features:

- **Default TTL**: 24 hours (86400000 milliseconds)
- **Scope**: Only valid VAT numbers are cached
- **Strategy**: In-memory cache with TTL expiration
- **Management**: Individual cache entries can be cleared, or all cache can be cleared at once

This reduces unnecessary calls to the VIES service and improves application performance.

## VIES Service Integration

The application integrates with the official EU VIES (VAT Information Exchange System) service operated by the European Commission. The VIES service provides:

- Real-time VAT number validation across EU member states
- Company name and address information when available
- Request date tracking

For more information about VIES, visit: https://ec.europa.eu/taxation_customs/vies/

## Quality Assurance

- **Type Checking**: Full TypeScript strict mode
- **Linting**: ESLint with Nuxt configuration
- **Code Style**: Consistent formatting with stylistic rules

Run checks:
```bash
pnpm lint          # Run ESLint
pnpm typecheck     # Run TypeScript checking
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on mobile, tablet, and desktop devices

## License

Please refer to the [LICENSE](LICENSE) file for licensing information.

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## Author

[roiLeo](https://github.com/roiLeo)

---

**Note**: This application is not an official EU service. It provides a user-friendly interface to interact with the official VIES service. Always verify critical VAT information through official channels.
