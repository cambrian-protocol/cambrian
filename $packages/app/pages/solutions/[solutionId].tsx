import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/src/ui/solutions/common/CreateProposalUI'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { SolutionModel } from '@cambrian/app/src/models/SolutionModel'
import { SolutionsHubAPI } from '@cambrian/app/src/services/api/SolutionsHub.api'
import { useRouter } from 'next/dist/client/router'

export default function SolutionPage() {
    const [currentSolution, setCurrentSolution] = useState<SolutionModel>()
    const router = useRouter()
    const { solutionId } = router.query

    useEffect(() => {
        if (!router.isReady) return

        if (solutionId !== undefined && typeof solutionId === 'string') {
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
    }, [router])

    return (
        <>
            {currentSolution && (
                <Layout contextTitle="Create Proposal">
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI solution={currentSolution} />
                    </Box>
                </Layout>
            )}
        </>
    )
}
