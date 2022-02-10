import { useEffect, useState, useContext } from 'react'

import { Box } from 'grommet'
import CreateTemplateUI from '@cambrian/app/src/ui/solutions/common/CreateTemplateUI'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { SolutionModel } from '@cambrian/app/src/models/SolutionModel'
import { useRouter } from 'next/dist/client/router'
import { CompositionAPI } from '@cambrian/app/services/api/Composition.api'
import { SolverModel } from '@cambrian/app/models/SolverModel'

export default function SolutionPage() {
    const router = useRouter()
    const { compositionURI } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<SolverModel[]>() // TODO Composition model

    useEffect(() => {
        if (!router.isReady) return

        if (
            compositionURI !== undefined &&
            typeof compositionURI === 'string'
        ) {
            CompositionAPI.getCompositionFromCID(compositionURI)
                .then((res) => setCurrentComposition(res))
                .catch((err) => {
                    console.error('Error while loading composition', err)
                    router.push('/404')
                })
        } else {
            console.error('No composition uri found')
            //router.push('/404')
        }
    }, [router])

    return (
        <>
            {currentComposition && (
                <Layout contextTitle="Create Template">
                    <Box justify="center" align="center" gap="small">
                        <CreateTemplateUI composition={currentComposition} />
                    </Box>
                </Layout>
            )}
        </>
    )
}
