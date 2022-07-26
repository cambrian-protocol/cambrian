import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from '../404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
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
            {isUserLoaded && !currentUser ? (
                <ConnectWalletSection />
            ) : show404NotFound ? (
                <Custom404Page />
            ) : (
                <PageLayout
                    contextTitle={templateInput?.title || 'Loading...'}
                    kind="narrow"
                >
                    <TemplateUI
                        ceramicTemplate={templateInput}
                        templateStreamID={templateStreamID}
                    />
                </PageLayout>
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
