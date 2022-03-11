import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SmileyXEyes } from 'phosphor-react'
import { Text } from 'grommet'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useRouter } from 'next/dist/client/router'

export default function CreateTemplatePage() {
    const ipfs = new IPFSAPI()

    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [isLoading, setIsLoading] = useState(true)
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        if (!router.isReady) return
        if (
            compositionCID !== undefined &&
            typeof compositionCID === 'string'
        ) {
            fetchComposition(compositionCID)
        } else {
            setShowError(true)
        }
    }, [router])

    const fetchComposition = async (compositionCID: string) => {
        setIsLoading(true)
        try {
            const compositionObject = (await ipfs.getFromCID(
                compositionCID
            )) as CompositionModel
            const parsedSolvers = await parseComposerSolvers(
                compositionObject.solvers
            )
            if (parsedSolvers && compositionObject) {
                setCurrentComposition(compositionObject)
            }
        } catch {
            setShowError(true)
            console.warn('Cannot parse and load composition')
        }
        setIsLoading(false)
    }

    return (
        <>
            <Layout contextTitle="Create Template">
                {currentComposition && (
                    <CreateTemplateUI composition={currentComposition} />
                )}
                {showError && (
                    <Box fill justify="center" align="center" gap="large">
                        <SmileyXEyes size="42" />
                        <Box width="medium">
                            <Text>
                                No valid composition found at provided CID
                            </Text>
                            <Text size="small" color="dark-4">
                                Please double check the Composition CID, try
                                again, or check with your composition creator if
                                the composition was valid when exported
                            </Text>
                        </Box>
                    </Box>
                )}
            </Layout>
            {isLoading && <LoadingScreen context="Loading composition" />}
        </>
    )
}
