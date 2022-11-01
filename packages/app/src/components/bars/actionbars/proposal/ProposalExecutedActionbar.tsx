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
import SolverListModal from '@cambrian/app/ui/common/modals/SolverListModal'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getSolverMethods } from '@cambrian/app/utils/helpers/solverHelpers'

interface ProposalExecutedActionbarProps {
    messenger?: JSX.Element
    proposalContract: ethers.Contract
    currentUser: UserType
}

export type SolverInfoType = { address: string; data: SolverModel }

const ProposalExecutedActionbar = ({
    currentUser,
    proposalContract,
}: ProposalExecutedActionbarProps) => {
    const [solvers, setSolvers] = useState<SolverInfoType[]>([])
    const [showSolverListModal, setShowSolverListModal] = useState(false)

    const toggleShowSolverListModal = () =>
        setShowSolverListModal(!showSolverListModal)

    useEffect(() => {
        initSolverAddress()
    }, [currentUser])

    const initSolverAddress = async () => {
        if (currentUser && proposalContract) {
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
    }

    return (
        <>
            <BaseActionbar
                primaryAction={
                    <Button
                        primary
                        size="small"
                        label="Work Solvers"
                        onClick={toggleShowSolverListModal}
                    />
                }
                info={{
                    title: 'Inspect Solvers',
                    subTitle: 'Check out the containing Solvers',
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Containing Work Solvers"
                            description='Hit the "Work Solvers"-Button at your right to inspect the Solvers created by this Proposal.'
                            list={[
                                {
                                    icon: <Cursor />,
                                    label: 'Select a Solver you want to inspect',
                                },
                            ]}
                        />
                    ),
                }}
            />
            {showSolverListModal && (
                <SolverListModal
                    solverInfos={solvers}
                    onClose={toggleShowSolverListModal}
                />
            )}
        </>
    )
}

export default ProposalExecutedActionbar
