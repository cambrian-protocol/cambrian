import { CAMBRIAN_LIB_NAME, ceramicInstance } from './CeramicUtils'

import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '../api/Logger.api'

export type ArbitratorContractFeeHashmap = { [address: string]: number }

/** 
 API functions to maintain arbitrator contracts and the users arbitrator-lib.
*/
export default class CeramicArbitratorAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
    }

    /**
     * Creates an arbitrator contract and adds it to the users arbitrator-lib.
     */
    createArbitrator = async (
        arbitratorContractAddress: string,
        fee: number
    ) => {
        try {
            if (!this.user.did || !this.user.session)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const arbitratorsLib = await TileDocument.deterministic(
                ceramicInstance(this.user),
                {
                    controllers: [this.user.did],
                    family: CAMBRIAN_LIB_NAME,
                    tags: ['arbitrators'],
                },
                { pin: true }
            )

            if (
                arbitratorsLib.content !== null &&
                typeof arbitratorsLib.content === 'object'
            ) {
                await arbitratorsLib.update(
                    {
                        ...arbitratorsLib.content,
                        [`${arbitratorContractAddress}`]: fee,
                    },
                    undefined,
                    { pin: true }
                )
            } else {
                await arbitratorsLib.update(
                    {
                        [`${arbitratorContractAddress}`]: fee,
                    },
                    undefined,
                    { pin: true }
                )
            }
        } catch (e) {
            cpLogger.pushError(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /* 
        Returns a hashmap with the users arbitrator contracts and it's fees on the connected chain.
    */
    getArbitratorContracts =
        async (): Promise<ArbitratorContractFeeHashmap> => {
            try {
                if (!this.user.did || !this.user.session)
                    throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

                const arbitratorContractsOnConnectedChain: ArbitratorContractFeeHashmap =
                    {}
                const arbitratorLib = (await TileDocument.deterministic(
                    ceramicInstance(this.user),
                    {
                        controllers: [this.user.did],
                        family: CAMBRIAN_LIB_NAME,
                        tags: ['arbitrators'],
                    },
                    { pin: true }
                )) as TileDocument<ArbitratorContractFeeHashmap>
                if (arbitratorLib.content) {
                    return arbitratorLib.content
                }
                return arbitratorContractsOnConnectedChain
            } catch (e) {
                cpLogger.pushError(e)
                throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
            }
        }
}
