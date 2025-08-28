/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 has app directory enabled by default
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
        querystring: false,
        punycode: false,
      }
    }
    
    // Handle Firebase compatibility
    config.externals = config.externals || []
    config.externals.push({
      'undici': 'undici',
    })
    
    return config
  },
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
