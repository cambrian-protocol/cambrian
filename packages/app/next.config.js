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
