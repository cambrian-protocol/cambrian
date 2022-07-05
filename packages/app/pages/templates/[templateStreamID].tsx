import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from '../404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ViewTemplateUI from '@cambrian/app/ui/templates/ViewTemplateUI'
import useTemplate from '@cambrian/app/hooks/useTemplate'

export default function ViewTemplatePage() {
    const {
        isUserLoaded,
        currentUser,
        templateInput,
        templateStreamID,
        errorMessage,
        setErrorMessage,
        show404NotFound,
    } = useTemplate()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : templateInput ? (
                        <PageLayout contextTitle={templateInput.title}>
                            <ViewTemplateUI
                                templateStreamID={templateStreamID as string}
                                template={templateInput}
                                currentUser={currentUser}
                            />
                        </PageLayout>
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
