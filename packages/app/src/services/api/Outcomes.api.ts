import { get } from '@cambrian/app/config/api/axios.config'

export const OutcomesAPI = {
    getDataFromCID: async (cid: string) => {
        // TODO fetch outcome
        //const response = await get(`https://gateway.pinata.cloud/ipfs/${cid}`)
        // const response = await get(`https://ipfs.infura.io/ipfs/${cid}`)

        // Dummy
        const response = {
            data: {
                id: '',
                uri: cid,
                title: 'Success',
                description: 'Success Description',
                context: '',
            },
        }

        return response.data
    },
}
