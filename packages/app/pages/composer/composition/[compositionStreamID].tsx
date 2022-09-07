import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ComposerPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <ComposerContextProvider>
                    <ComposerUI currentUser={currentUser} />
                </ComposerContextProvider>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
