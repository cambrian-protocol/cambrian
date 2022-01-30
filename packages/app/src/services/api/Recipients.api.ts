import { useCurrentSolver } from './../../hooks/useCurrentSolver'

// TODO Note: Name will not be stored if slottype callback/function
export const RecipientsAPI = {
    getRecipientDetail: async (recipientAddress: string) => {
        const { currentSolverConfig } = useCurrentSolver()

        if (currentSolverConfig) {
            // TODO Retrieve recipient details from address
            /*  const recipient = addresses.map((address) => {
                const response = await get(`https://ipfs.infura.io/ipfs/${}`)
            }) */

            // Dummy
            const response = {
                data: {
                    recipient: {
                        name: 'Keeper',
                        address: '0x194ba7A048627fb546fCAFBA8a4e8cA3DB588239',
                    },
                },
            }
            return response.data
        }
    },
    getRecipientsDetail: async () => {
        const { currentSolverConfig } = useCurrentSolver()

        if (currentSolverConfig) {
            // TODO Retrieve recipient addresses from currentSolverConfig
            const addresses: string[] = []

            // TODO Retrieve recipient details from addresses
            /*  const recipients = addresses.map((address) => {
                const response = await get(`https://ipfs.infura.io/ipfs/${}`)
            }) */

            // Dummy
            const response = {
                data: {
                    recipients: [
                        {
                            recipient: {
                                name: 'Keeper',
                                address:
                                    '0x194ba7A048627fb546fCAFBA8a4e8cA3DB588239',
                            },
                        },
                        {
                            recipient: {
                                name: 'Writer',
                                address: '0x0000000001',
                            },
                        },
                        {
                            recipient: {
                                name: 'Treasury',
                                address: '0x0000000002',
                            },
                        },
                        {
                            recipient: {
                                name: 'Cambrians',
                                address: '0x0000000003',
                            },
                        },
                    ],
                },
            }
            return response.data
        }
    },
}
