module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)?',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, content-type, Authorization',
                    },
                ],
            },
        ]
    },
}

module.exports = {
    webpack(config, options) {
        const { isServer } = options
        config.module.rules.push({
            test: /\.(ogg|mp3|wav|mpe?g)$/i,
            exclude: config.exclude,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: config.inlineImageLimit,
                        fallback: require.resolve('file-loader'),
                        publicPath: `${config.assetPrefix}/_next/static/sounds/`,
                        outputPath: `${isServer ? '../' : ''}static/sounds/`,
                        name: '[name]-[hash].[ext]',
                        esModule: config.esModule || false,
                    },
                },
            ],
        })

        return config
    },
}
