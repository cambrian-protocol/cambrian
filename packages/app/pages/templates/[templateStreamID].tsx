import Custom404Page from '../404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateUI from '@cambrian/app/ui/templates/TemplateUI'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

export default function ViewTemplatePage() {
    const {
        templateInput,
        templateStreamID,
        errorMessage,
        setErrorMessage,
        show404NotFound,
    } = useEditTemplate()

    return (
        <>
            {show404NotFound ? (
                <Custom404Page />
            ) : (
                <PageLayout
                    contextTitle={templateInput?.title || 'Template'}
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
