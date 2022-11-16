import { Box, Tab, Tabs } from 'grommet'
import { Clipboard, Eye } from 'phosphor-react'
import { SetStateAction, useContext, useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface EditTemplateUIProps {
    cachedTemplateTitle: string
    templateInput: TemplateModel
    setTemplateInput: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    templateStreamID: string
    onSaveTemplate: () => Promise<boolean>
    onResetTemplate: () => void
    composition: CompositionModel
}

const EditTemplateUI = ({
    cachedTemplateTitle,
    templateInput,
    setTemplateInput,
    onSaveTemplate,
    onResetTemplate,
    composition,
    templateStreamID,
}: EditTemplateUIProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [authorProfile] = useCambrianProfile(templateInput.author)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    const onSubmit = async () => {
        await onSaveTemplate()
    }
    return (
        <Box gap="medium">
            <BaseHeader
                authorProfileDoc={authorProfile}
                title={cachedTemplateTitle}
                metaTitle="Edit Template"
                items={[
                    {
                        label: 'View Template',
                        icon: <Eye color={cpTheme.global.colors['dark-4']} />,
                        href: `/solver/${templateStreamID}`,
                    },
                    {
                        label: 'Copy URL',
                        icon: (
                            <Clipboard
                                color={cpTheme.global.colors['dark-4']}
                            />
                        ),
                        value: `${window.location.host}/solver/${templateStreamID}`,
                    },
                ]}
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
                        onSubmit={onSubmit}
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
                        onSubmit={onSubmit}
                        onCancel={onResetTemplate}
                    />
                </Tab>
                {templateInput.flexInputs.length > 0 && (
                    <Tab title="Solver Config">
                        <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                            <HeaderTextSection
                                size="small"
                                title="Solver Config"
                                paragraph="Configure the Solver by completing these fields as instructed."
                            />
                        </Box>
                        <TemplateFlexInputsForm
                            composition={composition}
                            templateInput={templateInput}
                            setTemplateInput={setTemplateInput}
                            onSubmit={onSubmit}
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
                        onSubmit={onSubmit}
                        onCancel={onResetTemplate}
                    />
                </Tab>
            </Tabs>
        </Box>
    )
}

export default EditTemplateUI
