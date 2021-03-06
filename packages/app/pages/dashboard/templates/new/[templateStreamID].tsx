import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateWizard from '@cambrian/app/ui/templates/wizard/TemplateWizard'
import _ from 'lodash'
import useTemplate from '@cambrian/app/hooks/useTemplate'

export default function NewTemplatePage() {
    const {
        isUserLoaded,
        currentUser,
        show404NotFound,
        templateInput,
        composition,
        setTemplateInput,
        templateStreamID,
        onSaveTemplate,
        errorMessage,
        setErrorMessage,
    } = useTemplate()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : templateInput && composition ? (
                        <PageLayout contextTitle="New Template" kind="narrow">
                            <TemplateWizard
                                composition={composition}
                                currentUser={currentUser}
                                templateInput={templateInput}
                                setTemplateInput={setTemplateInput}
                                templateStreamID={templateStreamID as string}
                                onSaveTemplate={onSaveTemplate}
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
