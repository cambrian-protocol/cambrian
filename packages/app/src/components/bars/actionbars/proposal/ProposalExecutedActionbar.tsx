import {
    ReclaimableTokensType,
    getAllReclaimableTokensFromProposal,
} from '@cambrian/app/utils/helpers/redeemHelper'
import {
    getSolverConfig,
    getSolverData,
    getSolverMetadata,
    getSolverOutcomes,
} from '@cambrian/app/components/solver/SolverGetters'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseActionbar from '../BaseActionbar'
import { Button } from 'grommet'
import { Cursor } from 'phosphor-react'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ReclaimTokensModal from '@cambrian/app/ui/common/modals/ReclaimTokensModal'
import SolverListModal from '@cambrian/app/ui/common/modals/SolverListModal'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getSolverMethods } from '@cambrian/app/utils/helpers/solverHelpers'
import { useRouter } from 'next/router'

interface ProposalExecutedActionbarProps {
    messenger?: JSX.Element
    proposalContract: ethers.Contract
    currentUser: UserType
}

export type SolverInfoType = { address: string; data: SolverModel }

const ProposalExecutedActionbar = ({
    currentUser,
    proposalContract,
    messenger,
}: ProposalExecutedActionbarProps) => {
    const router = useRouter()
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
        initSolverAddress()
        initReclaimableTokens()
    }, [])

    const initReclaimableTokens = async () => {
        setReclaimableTokens(
            await getAllReclaimableTokensFromProposal(
                proposalContract,
                currentUser
            )
        )
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
        const ipfsSolutionsHub = new IPFSSolutionsHub(
            currentUser.signer,
            currentUser.chainId
        )
        const solverAddresses = await ipfsSolutionsHub.getSolvers(
            proposalContract.solutionId
        )
        if (solverAddresses && solverAddresses.length > 0) {
            const solvers = await Promise.all(
                solverAddresses.map(async (solverAddress) => {
                    const solverContract = new ethers.Contract(
                        solverAddress,
                        BASE_SOLVER_IFACE,
                        currentUser.signer
                    )
                    const solverMethods = getSolverMethods(
                        solverContract.interface,
                        async (method: string, ...args: any[]) =>
                            await solverContract[method](...args)
                    )
                    const fetchedMetadata = await getSolverMetadata(
                        solverContract,
                        currentUser.signer,
                        currentUser.chainId
                    )

                    const fetchedSolverConfig = await getSolverConfig(
                        solverContract
                    )
                    const fetchedOutcomes = await getSolverOutcomes(
                        fetchedSolverConfig
                    )

                    const solverData = await getSolverData(
                        solverContract,
                        solverMethods,
                        currentUser,
                        fetchedOutcomes,
                        fetchedMetadata,
                        fetchedSolverConfig
                    )

                    return {
                        address: solverAddress,
                        data: solverData,
                    }
                })
            )
            setSolvers(solvers)
        }
    }

    return (
        <>
            <BaseActionbar
                messenger={messenger}
                secondaryAction={
                    reclaimableTokens && (
                        <LoaderButton
                            isLoading={solvers === undefined}
                            secondary
                            size="small"
                            label="View Solver"
                            onClick={viewSolvers}
                        />
                    )
                }
                primaryAction={
                    reclaimableTokens ? (
                        <Button
                            size="small"
                            primary
                            label={'Reclaim'}
                            onClick={toggleShowReclaimTokensModal}
                        />
                    ) : (
                        <LoaderButton
                            isLoading={solvers === undefined}
                            primary
                            size="small"
                            label="View Solver"
                            onClick={viewSolvers}
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
            {showReclaimTokensModal && reclaimableTokens && (
                <ReclaimTokensModal
                    reclaimableTokens={reclaimableTokens}
                    onClose={toggleShowReclaimTokensModal}
                    updateReclaimableTokens={initReclaimableTokens}
                />
            )}
        </>
    )
}

export default ProposalExecutedActionbar
