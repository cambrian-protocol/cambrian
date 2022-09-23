import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateWizard from '@cambrian/app/ui/templates/wizard/TemplateWizard'
import _ from 'lodash'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

export default function NewTemplatePage() {
    const {
        show404NotFound,
        templateInput,
        composition,
        setTemplateInput,
        templateStreamID,
        onSaveTemplate,
        errorMessage,
        setErrorMessage,
    } = useEditTemplate()

    return (
        <>
            {show404NotFound ? (
                <Custom404Page />
            ) : templateInput && composition ? (
                <PageLayout contextTitle="New Template" kind="narrow">
                    <TemplateWizard
                        composition={composition}
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        templateStreamID={templateStreamID as string}
                        onSaveTemplate={onSaveTemplate}
                    />
                </PageLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
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
