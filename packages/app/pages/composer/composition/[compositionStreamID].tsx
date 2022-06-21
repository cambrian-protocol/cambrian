import { useEffect, useState } from 'react'

import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function ComposerPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    const [composition, setComposition] = useState<CompositionModel>()

    useEffect(() => {
        // TODO fetch composition from path
        // TODO doing this, will overwrite state on refresh if not saved..
    }, [])
    return (
        <>
            {isUserLoaded ? (
                currentUser && composition ? (
                    <ComposerContextProvider>
                        <ComposerUI
                            currentUser={currentUser}
                            composition={composition}
                        />
                    </ComposerContextProvider>
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
