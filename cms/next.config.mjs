import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default withPayload({
  outputFileTracingRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
      ],
    }]
  },
})
