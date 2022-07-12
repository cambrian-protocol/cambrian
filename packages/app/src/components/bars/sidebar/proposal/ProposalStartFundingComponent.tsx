import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/transformers/Composition'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useState } from 'react'

const CID = require('cids')

interface ProposalStartFundingComponentProps {
    currentUser: UserType
    ceramicProposal: CeramicProposalModel
    ceramicTemplate: CeramicTemplateModel
    proposalStreamID: string
}

const ProposalStartFundingComponent = ({
    currentUser,
    ceramicTemplate,
    ceramicProposal,
    proposalStreamID,
}: ProposalStartFundingComponentProps) => {
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            const cs = new CeramicStagehand(currentUser.selfID)

            const ceramicComposition = (await (
                await cs.loadStream(ceramicTemplate.composition.commitID)
            ).content) as CompositionModel

            const compositionWithFlexInputs = mergeFlexIntoComposition(
                mergeFlexIntoComposition(
                    ceramicComposition,
                    ceramicTemplate.flexInputs
                ),
                ceramicProposal.flexInputs
            )

            if (ceramicTemplate.price.isCollateralFlex) {
                compositionWithFlexInputs.solvers.forEach((solver) => {
                    solver.config.collateralToken =
                        ceramicProposal.price.tokenAddress
                })
            }

            const parsedSolvers = await parseComposerSolvers(
                compositionWithFlexInputs.solvers,
                currentUser.web3Provider
            )
            if (parsedSolvers) {
                const proposalsHub = new ProposalsHub(
                    currentUser.signer,
                    currentUser.chainId
                )

                // Pin solverConfigs separately to have access without metaData from Solution
                const ipfs = new IPFSAPI()
                const ipfsSolverConfigs = await ipfs.pin(
                    parsedSolvers.map((solver) => solver.config)
                )

                if (!ipfsSolverConfigs || !ipfsSolverConfigs.IpfsHash)
                    throw GENERAL_ERROR['IPFS_PIN_ERROR']

                console.log('SolverConfigs CID', ipfsSolverConfigs.IpfsHash)

                // TODO Temp - can be passed as prop if works
                const proposalDoc = await cs.loadStream(proposalStreamID)

                console.log('proposaldoc ID: ', proposalDoc.id)

                const transaction =
                    await proposalsHub.createSolutionAndProposal(
                        parsedSolvers[0].collateralToken,
                        ceramicProposal.price.amount,
                        parsedSolvers.map((solver) => solver.config),
                        ipfsSolverConfigs.IpfsHash,
                        proposalDoc.id.cid.toString()
                    )
                let rc = await transaction.wait()
                const event = rc.events?.find(
                    (event) => event.event === 'CreateProposal'
                ) // Less fragile to event param changes.
                const proposalId = event?.args && event.args.id
                console.log(proposalId)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    function toHexString(byteArray: Uint8Array) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xff).toString(16)).slice(-2)
        }).join('')
    }

    return (
        <>
            <BaseFormGroupContainer pad="medium" gap="medium">
                <Text>
                    Proposal has been approved. This action deployes the
                    Proposal on chain
                </Text>
                <LoaderButton
                    isLoading={isInTransaction}
                    label="Start funding"
                    primary
                    size="small"
                    onClick={onDeployProposal}
                />
            </BaseFormGroupContainer>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalStartFundingComponent
