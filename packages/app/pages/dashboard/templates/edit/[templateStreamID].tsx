import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import EditTemplateUI from '@cambrian/app/ui/templates/EditTemplateUI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import _ from 'lodash'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

export default function EditTemplatePage() {
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
        cachedTemplate,
        onResetTemplate,
    } = useEditTemplate()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : templateInput && composition && cachedTemplate ? (
                        <PageLayout contextTitle="Edit Template" kind="narrow">
                            <EditTemplateUI
                                cachedTemplateTitle={cachedTemplate.title}
                                composition={composition}
                                currentUser={currentUser}
                                templateInput={templateInput}
                                setTemplateInput={setTemplateInput}
                                templateStreamID={templateStreamID as string}
                                onSaveTemplate={onSaveTemplate}
                                onResetTemplate={onResetTemplate}
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
