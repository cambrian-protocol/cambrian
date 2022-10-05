import { Coins, RocketLaunch } from 'phosphor-react'
import {
    deployProposal,
    deploySolutionBase,
    getSolutionSafeBaseId,
} from '@cambrian/app/utils/helpers/proposalHelper'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalStartFundingControlProps {
    currentUser: UserType
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
}

const ProposalStartFundingControl = ({
    currentUser,
    isApproving,
    setIsApproving,
}: ProposalStartFundingControlProps) => {
    const solutionsHub = new IPFSSolutionsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const { stageStack } = useProposalContext()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [solutionBase, setSolutionBase] = useState<SolutionModel>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        fetchSolution()
    }, [isApproving])

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (stageStack) {
                await deployProposal(currentUser, stageStack)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    const onDeploySolution = async () => {
        setIsApproving(true)
        try {
            if (stageStack) {
                await deploySolutionBase(currentUser, stageStack)
                await fetchSolution()
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsApproving(false)
    }

    const fetchSolution = async () => {
        if (stageStack) {
            const baseId = getSolutionSafeBaseId(
                stageStack.proposalCommitID,
                stageStack.proposal.template.commitID
            )
            const solution = await solutionsHub.contract.bases(baseId)
            if (solution?.id !== ethers.constants.HashZero) {
                setSolutionBase(solution)
            }
            setIsLoaded(true)
        }
    }

    return (
        <>
            {isLoaded ? (
                solutionBase ? (
                    <Box gap="medium">
                        <PlainSectionDivider />
                        <LoaderButton
                            isLoading={isInTransaction}
                            label="Start funding"
                            primary
                            icon={<Coins />}
                            size="small"
                            onClick={onDeployProposal}
                        />
                    </Box>
                ) : (
                    <Box gap="medium">
                        <PlainSectionDivider />
                        <LoaderButton
                            isLoading={isApproving}
                            label="Deploy Solution"
                            primary
                            icon={<RocketLaunch />}
                            size="small"
                            onClick={onDeploySolution}
                        />
                    </Box>
                )
            ) : (
                <></>
            )}

            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalStartFundingControl
