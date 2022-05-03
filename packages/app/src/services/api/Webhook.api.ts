import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { WEBHOOK_API_ENDPOINT } from 'packages/app/config'
import { cpLogger } from './Logger.api'

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
            cpLogger.push(e)
            throw GENERAL_ERROR['POST_WEBHOOK_ERROR']
        }
    },
}
