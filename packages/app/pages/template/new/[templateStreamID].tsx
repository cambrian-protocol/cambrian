import Custom404Page from 'packages/app/pages/404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateWizard from '@cambrian/app/ui/templates/wizard/TemplateWizard'
import _ from 'lodash'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

export default function NewTemplatePage() {
    const editTemplateContext = useEditTemplate()
    const { show404NotFound, template, composition } = editTemplateContext

    return (
        <>
            {show404NotFound ? (
                <Custom404Page />
            ) : template && composition ? (
                <PageLayout contextTitle="New Template" kind="narrow">
                    <TemplateWizard editTemplateProps={editTemplateContext} />
                </PageLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
            )}
        </>
    )
}
