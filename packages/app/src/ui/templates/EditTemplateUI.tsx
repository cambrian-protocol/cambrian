import { Box, Tab, Tabs } from 'grommet'
import { SetStateAction, useContext, useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
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
    templateStreamID,
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
            <TemplateHeader
                title={cachedTemplateTitle}
                link={`${window.location.origin}/templates/${templateStreamID}`}
            />
            <Tabs
                justify="start"
                activeIndex={activeIndex}
                onActive={(nextIndex: number) => setActiveIndex(nextIndex)}
            >
                <Tab title="Description">
                    <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                        <HeaderTextSection
                            size="small"
                            title={`What service are you offering?`}
                            paragraph="Let the world know how you can help."
                        />
                    </Box>
                    <TemplateDescriptionForm
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSubmit={onSaveTemplate}
                        onCancel={onResetTemplate}
                    />
                </Tab>
                <Tab title="Pricing">
                    <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                        <HeaderTextSection
                            size="small"
                            title="How much does it cost?"
                            paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
                        />
                    </Box>
                    <TemplatePricingForm
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSubmit={onSaveTemplate}
                        onCancel={onResetTemplate}
                        currentUser={currentUser}
                    />
                </Tab>
                {templateInput.flexInputs.length > 0 && (
                    <Tab title="Solver Config">
                        <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                            <HeaderTextSection
                                size="small"
                                title="Solver Config"
                                paragraph="These fields configure the Solver for you and your service. Leave blank those which should be completed by a customer (e.g. 'Client Address')"
                            />
                        </Box>
                        <TemplateFlexInputsForm
                            composition={composition}
                            templateInput={templateInput}
                            setTemplateInput={setTemplateInput}
                            onSubmit={onSaveTemplate}
                            onCancel={onResetTemplate}
                        />
                    </Tab>
                )}
                <Tab title="Requirements">
                    <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                        <HeaderTextSection
                            size="small"
                            title="Requirements"
                            paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
                        />
                    </Box>
                    <TemplateRequirementsForm
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSubmit={onSaveTemplate}
                        onCancel={onResetTemplate}
                    />
                </Tab>
            </Tabs>
        </Box>
    )
}

export default EditTemplateUI
