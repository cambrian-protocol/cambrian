import React, { useEffect, useState } from 'react'
import {
    ReclaimableTokensType,
    getAllReclaimableTokensFromProposal,
} from '@cambrian/app/utils/helpers/redeemHelper'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import { Button } from 'grommet'
import { Cursor } from 'phosphor-react'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ReclaimAndRedeemTokensModal from '@cambrian/app/ui/common/modals/ReclaimAndRedeemTokensModal'
import { SolverInfoType } from '../ProposalExecutedActionbar'
import SolverListModal from '@cambrian/app/ui/common/modals/SolverListModal'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

interface IExecutedBar {
    proposal: Proposal
}

const ExecutedBar = ({ proposal }: IExecutedBar) => {
    const router = useRouter()
    const { currentUser, isUserLoaded } = useCurrentUserContext()
    const [solvers, setSolvers] = useState<SolverInfoType[]>()
    const [showSolverListModal, setShowSolverListModal] = useState(false)
    const [reclaimableTokens, setReclaimableTokens] =
        useState<ReclaimableTokensType>()
    const [showReclaimTokensModal, setShowReclaimTokensModal] = useState(false)

    const toggleShowReclaimTokensModal = () =>
        setShowReclaimTokensModal(!showReclaimTokensModal)

    const toggleShowSolverListModal = () =>
        setShowSolverListModal(!showSolverListModal)

    useEffect(() => {
        if (currentUser) {
            initSolverAddress()
            initReclaimableTokens()
        }
    }, [isUserLoaded])

    const initReclaimableTokens = async () => {
        if (currentUser) {
            setReclaimableTokens(
                await getAllReclaimableTokensFromProposal(
                    proposal.onChainProposal,
                    currentUser
                )
            )
        }
    }

    const viewSolvers = () => {
        if (solvers) {
            if (solvers.length > 1) {
                toggleShowSolverListModal()
            } else {
                router.push(`/solver/${solvers[0].address}`)
            }
        }
    }

    const initSolverAddress = async () => {
        try {
            const _solvers = await proposal.fetchAllSolvers()
            if (!_solvers) throw new Error('Failed to fetch all Solvers')
            setSolvers(_solvers)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <BaseActionbar
                primaryAction={
                    <LoaderButton
                        isInitializing={solvers === undefined}
                        primary
                        size="small"
                        label="View Solver"
                        onClick={viewSolvers}
                    />
                }
                secondaryAction={
                    reclaimableTokens && (
                        <Button
                            size="small"
                            secondary
                            label={'Refunds'}
                            onClick={toggleShowReclaimTokensModal}
                        />
                    )
                }
                info={{
                    title: 'View Solver',
                    subTitle: 'View the Solver(s) created by this Proposal',
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Solver"
                            description='Hit the "View Solver"-Button on the right to inspect the Solver(s) created by this Proposal.'
                            list={[
                                {
                                    icon: <Cursor />,
                                    label: 'Select a Solver',
                                },
                            ]}
                        />
                    ),
                }}
            />
            {showSolverListModal && solvers && (
                <SolverListModal
                    solverInfos={solvers}
                    onClose={toggleShowSolverListModal}
                />
            )}
            {showReclaimTokensModal && reclaimableTokens && solvers && (
                <ReclaimAndRedeemTokensModal
                    currentUser={proposal.auth!}
                    solverInfos={solvers}
                    reclaimableTokens={reclaimableTokens}
                    onClose={toggleShowReclaimTokensModal}
                    updateReclaimableTokens={initReclaimableTokens}
                />
            )}
        </>
    )
}

export default ExecutedBar
