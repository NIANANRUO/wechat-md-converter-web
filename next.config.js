const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const repoBasePath = '/wechat-md-converter-web'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGitHubActions ? repoBasePath : undefined,
  assetPrefix: isGitHubActions ? `${repoBasePath}/` : undefined,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
