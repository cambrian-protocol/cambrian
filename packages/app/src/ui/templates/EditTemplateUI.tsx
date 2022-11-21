import { Box, Tab, Tabs } from 'grommet'
import { Clipboard, Eye } from 'phosphor-react'
import { SetStateAction, useContext, useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

const EditTemplateUI = () => {
    const editTemplateContext = useEditTemplate()
    const { template, templateStreamID, cachedTemplate } = editTemplateContext
    const [activeIndex, setActiveIndex] = useState(0)
    const [authorProfile] = useCambrianProfile(template?.author)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    if (!template) {
        return null
    }

    return (
        <Box gap="medium">
            <BaseHeader
                authorProfileDoc={authorProfile}
                title={cachedTemplate?.title || 'Untitled'}
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
                        editTemplateContext={editTemplateContext}
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
                        editTemplateContext={editTemplateContext}
                    />
                </Tab>
                {template.flexInputs.length > 0 && (
                    <Tab title="Solver Config">
                        <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                            <HeaderTextSection
                                size="small"
                                title="Solver Config"
                                paragraph="Configure the Solver by completing these fields as instructed."
                            />
                        </Box>
                        <TemplateFlexInputsForm
                            editTemplateContext={editTemplateContext}
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
                        editTemplateContext={editTemplateContext}
                    />
                </Tab>
            </Tabs>
        </Box>
    )
}

export default EditTemplateUI
