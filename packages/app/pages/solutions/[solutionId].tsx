import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/src/ui/solutions/common/CreateProposalUI'
import { SolutionModel } from '@cambrian/app/src/models/SolutionModel'
import { SolutionsHubAPI } from '@cambrian/app/src/services/api/SolutionsHub.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function SolutionPage() {
    const { currentUser, currentProvider, login } = useCurrentUser()
    const router = useRouter()
    const { solutionId } = router.query
    const [currentSolution, setCurrentSolution] = useState<SolutionModel>()

    useEffect(() => {
        async function getLogin() {
            await login()
        }
        if (!currentProvider) {
            getLogin()
        } else {
            console.log(currentProvider)
        }
    }, [])

    useEffect(() => {
        if (!router.isReady) return

        if (
            currentProvider &&
            solutionId !== undefined &&
            typeof solutionId === 'string'
        ) {
            SolutionsHubAPI.getSolutionFromSolutionId(solutionId)
                .then((res) => setCurrentSolution(res.solution))
                .catch((err) => {
                    console.error('Error while loading solution', err)
                    router.push('/404')
                })
        } else {
            console.error('No solution identifier found')
            //router.push('/404')
        }
    }, [currentUser, router])

    return (
        <>
            {currentSolution && (
                <BaseLayout contextTitle="Create Proposal">
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI solution={currentSolution} />
                    </Box>
                </BaseLayout>
            )}
        </>
    )
}
