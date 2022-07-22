import { Box, Tab, Tabs } from 'grommet'
import { SetStateAction, useContext, useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import TemplateHeader from '@cambrian/app/components/layout/header/TemplateHeader'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'

interface EditTemplateUIProps {
    cachedTemplateTitle: string
    currentUser: UserType
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    templateStreamID: string
    onSaveTemplate: () => Promise<void>
    onResetTemplate: () => void
    composition: CompositionModel
}

const EditTemplateUI = ({
    cachedTemplateTitle,
    templateInput,
    setTemplateInput,
    onSaveTemplate,
    onResetTemplate,
    currentUser,
    composition,
}: EditTemplateUIProps) => {
    const [activeIndex, setActiveIndex] = useState(0)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    return (
        <Box gap="medium" pad="medium">
            <TemplateHeader title={cachedTemplateTitle} />
            <Tabs
                justify="start"
                activeIndex={activeIndex}
                onActive={(nextIndex: number) => setActiveIndex(nextIndex)}
            >
                <Tab title="Description">
                    <Box pad="small">
                        <TemplateDescriptionForm
                            templateInput={templateInput}
                            setTemplateInput={setTemplateInput}
                            onSubmit={onSaveTemplate}
                            onCancel={onResetTemplate}
                        />
                    </Box>
                </Tab>
                <Tab title="Pricing">
                    <Box pad="small">
                        <TemplatePricingForm
                            templateInput={templateInput}
                            setTemplateInput={setTemplateInput}
                            onSubmit={onSaveTemplate}
                            onCancel={onResetTemplate}
                            currentUser={currentUser}
                        />
                    </Box>
                </Tab>
                {templateInput.flexInputs.length > 0 && (
                    <Tab title="Solver Config">
                        <Box pad="small">
                            <TemplateFlexInputsForm
                                composition={composition}
                                templateInput={templateInput}
                                setTemplateInput={setTemplateInput}
                                onSubmit={onSaveTemplate}
                                onCancel={onResetTemplate}
                            />
                        </Box>
                    </Tab>
                )}
                <Tab title="Requirements">
                    <Box pad="small">
                        <TemplateRequirementsForm
                            templateInput={templateInput}
                            setTemplateInput={setTemplateInput}
                            onSubmit={onSaveTemplate}
                            onCancel={onResetTemplate}
                        />
                    </Box>
                </Tab>
            </Tabs>
        </Box>
    )
}

export default EditTemplateUI
