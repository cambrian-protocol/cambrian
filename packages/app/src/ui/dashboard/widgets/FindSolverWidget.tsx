import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { Box, Text, TextInput } from 'grommet'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import BaseSolverCard from '@cambrian/app/components/cards/BaseSolverCard'
import ProposalCard from '@cambrian/app/components/list/BaseProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getSolverMetadata } from '@cambrian/app/components/solver/SolverGetters'
import { useState } from 'react'

interface FindSolverWidgetProps {
    currentUser: UserType
}

const FindSolverWidget = ({ currentUser }: FindSolverWidgetProps) => {
    const [isFetching, setIsFetching] = useState(false)
    const [solverAddressInput, setSolverAddressInput] = useState('')

    const [fetchedSolver, setFetchedSolver] = useState<JSX.Element>()

    const fetchSolver = async (solverAddress: string) => {
        setIsFetching(true)
        setSolverAddressInput(solverAddress)
        try {
            const id = solverAddress.includes('solver/')
                ? solverAddress.split('solver/')[1]
                : solverAddress

            if (id.startsWith('0x')) {
                const solverContract = new ethers.Contract(
                    id,
                    BASE_SOLVER_IFACE,
                    currentUser.web3Provider
                )
                const solverMetaData = await getSolverMetadata(
                    solverContract,
                    currentUser.web3Provider
                )

                if (solverMetaData) {
                    setFetchedSolver(
                        <BaseSolverCard
                            type={'Work Solver'}
                            title={solverMetaData.solverTag.title}
                            description={solverMetaData.solverTag.description}
                            streamID={id}
                        />
                    )
                }
            } else {
                const stage = await API.doc.readStream<any>(id)

                if (!stage) throw new Error('Failed to load stage')

                if (stage.content.solvers) {
                    // Its a Composition
                    setFetchedSolver(
                        <BaseSolverCard
                            type={'Composition'}
                            title={stage.content.title}
                            description={stage.content.description}
                            streamID={id}
                        />
                    )
                } else if (stage.content.composition) {
                    // Its a Template
                    setFetchedSolver(
                        <BaseSolverCard
                            type={'Template'}
                            title={stage.content.title}
                            description={stage.content.description}
                            streamID={id}
                        />
                    )
                } else if (stage.content.template) {
                    // Its a Proposal
                    setFetchedSolver(
                        <ProposalCard
                            currentUser={currentUser}
                            proposalDoc={stage as DocumentModel<ProposalModel>}
                        />
                    )
                }
            }
        } catch {
            setFetchedSolver(undefined)
        }
        setIsFetching(false)
    }

    return (
        <Box gap="small">
            <Text>Find a Solver via URL</Text>
            <Box direction="row" align="center" gap="small">
                <TextInput
                    placeholder="https://cambrianprotocol.com/solver/k2t..."
                    value={solverAddressInput}
                    onChange={(e) => fetchSolver(e.target.value)}
                />
            </Box>
            {isFetching ? <BaseSkeletonBox height="small" /> : fetchedSolver}
        </Box>
    )
}

export default FindSolverWidget
