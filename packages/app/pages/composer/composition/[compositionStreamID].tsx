import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import { CompositionContextProvider } from '@cambrian/app/store/composition.context'
import Custom404Page from '../../404'
import { useRouter } from 'next/router'

export default function ComposerPage() {
    const router = useRouter()
    const { compositionStreamID } = router.query

    return (
        <>
            {compositionStreamID && typeof compositionStreamID === 'string' ? (
                <CompositionContextProvider
                    compositionStreamID={compositionStreamID}
                >
                    <ComposerUI />
                </CompositionContextProvider>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}
