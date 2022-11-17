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
        show404NotFound,
        template,
        composition,
        errorMessage,
        setErrorMessage,
        cachedTemplate,
    } = useEditTemplate()

    return (
        <>
            {show404NotFound ? (
                <Custom404Page />
            ) : template && composition && cachedTemplate ? (
                <PageLayout contextTitle="Edit Template" kind="narrow">
                    <EditTemplateUI />
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
