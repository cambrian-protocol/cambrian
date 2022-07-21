import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from '../404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateUI from '@cambrian/app/ui/templates/TemplateUI'
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
                        <PageLayout
                            contextTitle={templateInput.title}
                            kind="narrow"
                        >
                            <TemplateUI
                                ceramicTemplate={templateInput}
                                currentUser={currentUser}
                                templateStreamID={templateStreamID}
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
