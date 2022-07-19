import { Button, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import Link from 'next/link'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalExecutedSidebar = () => {
    const { currentUser } = useCurrentUser()
    const { proposalContract } = useProposal()
    const [firstSolverAddress, setFirstSolverAddress] = useState<string>()

    useEffect(() => {
        initSolverAddress()
    }, [currentUser])

    const initSolverAddress = async () => {
        if (currentUser && proposalContract) {
            const ipfsSolutionsHub = new IPFSSolutionsHub(
                currentUser.signer,
                currentUser.chainId
            )
            const solvers = await ipfsSolutionsHub.getSolvers(
                proposalContract.solutionId
            )
            if (solvers && solvers.length > 0) {
                setFirstSolverAddress(solvers[0])
            }
        }
    }

    return (
        <>
            {firstSolverAddress && (
                <BaseFormGroupContainer border pad="medium" gap="medium">
                    <Text>
                        This Proposal has been funded and executed. To start
                        working with it visit the first Solve
                    </Text>
                    <Link
                        href={`${window.location.origin}/solvers/${firstSolverAddress}`}
                        passHref
                    >
                        <Button label="Go to Solver" primary size="small" />
                    </Link>
                </BaseFormGroupContainer>
            )}
        </>
    )
}

export default ProposalExecutedSidebar
