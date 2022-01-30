import axios from 'axios'

export const CURRENT_USER_KEY = '__user_traits'

const apiClient = axios.create()

apiClient.interceptors.request.use(
    function (config) {
        if (sessionStorage) {
            const storedUserEncoded = sessionStorage.getItem(CURRENT_USER_KEY)
            if (storedUserEncoded) {
                const storedUser = JSON.parse(storedUserEncoded)
                if (storedUser.access_token && config.headers !== undefined) {
                    config.headers['Authorization'] =
                        'Bearer ' + storedUser.access_token
                }
            }
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

apiClient.defaults.headers.post['Content-Type'] = 'application/json'

const { get, post, put, delete: destroy } = apiClient
export { get, post, put, destroy }
