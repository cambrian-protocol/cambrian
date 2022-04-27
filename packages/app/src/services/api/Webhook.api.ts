import { ERROR_MESSAGE } from '@cambrian/app/constants/ErrorMessages'
import { WEBHOOK_API_ENDPOINT } from 'packages/app/config'

export const WebhookAPI = {
    postWebhook: async (
        webhook: string,
        watchword: string
    ): Promise<Response> => {
        try {
            const data = {
                url: webhook,
                watchword: watchword,
            }
            return await fetch(WEBHOOK_API_ENDPOINT, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            })
        } catch (e: any) {
            console.error(e)
            throw new Error(ERROR_MESSAGE['POST_WEBHOOK_ERROR'])
        }
    },
}
