import { Box, Tab, Tabs } from 'grommet'
import { Clipboard, Eye } from 'phosphor-react'
import { useContext, useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import TemplateUpdateFromComposition from './forms/TemplateUpdateFromComposition'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

const EditTemplateUI = () => {
    const { template } = useTemplateContext()
    const [activeIndex, setActiveIndex] = useState(0)
    const [authorProfile] = useCambrianProfile(template?.content.author)

    // Scroll up when tab changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    return (
        <>
            {template ? (
                <PageLayout
                    contextTitle={`Edit | ${template.content.title}`}
                    kind="narrow"
                >
                    <Box gap="medium">
                        <BaseHeader
                            authorProfileDoc={authorProfile}
                            title={template.content.title || 'Untitled'}
                            metaTitle="Edit Template"
                            items={[
                                {
                                    label: 'View Template',
                                    icon: (
                                        <Eye
                                            color={
                                                cpTheme.global.colors['dark-4']
                                            }
                                        />
                                    ),
                                    href: `/solver/${template.doc.streamID}`,
                                },
                                {
                                    label: 'Copy URL',
                                    icon: (
                                        <Clipboard
                                            color={
                                                cpTheme.global.colors['dark-4']
                                            }
                                        />
                                    ),
                                    value: `${window.location.host}/solver/${template.doc.streamID}`,
                                },
                            ]}
                        />
                        <Tabs
                            justify="start"
                            activeIndex={activeIndex}
                            onActive={(nextIndex: number) =>
                                setActiveIndex(nextIndex)
                            }
                        >
                            <Tab title="Description">
                                <Box
                                    pad={{
                                        top: 'medium',
                                    }}
                                >
                                    <HeaderTextSection
                                        size="small"
                                        title={`What service are you offering?`}
                                        paragraph="Let the world know how you can help."
                                    />
                                </Box>
                                <TemplateDescriptionForm template={template} />
                            </Tab>
                            <Tab title="Pricing">
                                <Box
                                    pad={{
                                        top: 'medium',
                                    }}
                                >
                                    <HeaderTextSection
                                        size="small"
                                        title="How much does it cost?"
                                        paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
                                    />
                                </Box>
                                <TemplatePricingForm template={template} />
                            </Tab>
                            {template.content.flexInputs.length > 0 && (
                                <Tab title="Solver Config">
                                    <Box
                                        pad={{
                                            top: 'medium',
                                        }}
                                    >
                                        <HeaderTextSection
                                            size="small"
                                            title="Solver Config"
                                            paragraph="Configure the Solver by completing these fields as instructed."
                                        />
                                    </Box>
                                    <TemplateFlexInputsForm
                                        template={template}
                                    />
                                </Tab>
                            )}
                            <Tab title="Requirements">
                                <Box
                                    pad={{
                                        top: 'medium',
                                    }}
                                >
                                    <HeaderTextSection
                                        size="small"
                                        title="Requirements"
                                        paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
                                    />
                                </Box>
                                <TemplateRequirementsForm template={template} />
                            </Tab>
                            <Tab title="Advanced">
                                <Box
                                    pad={{
                                        top: 'medium',
                                    }}
                                >
                                    <HeaderTextSection
                                        size="small"
                                        title="Update Template from Composition"
                                        paragraph="Update this template to use the newest version of its source Composition. Existing proposals for this Template will not be affected."
                                    />
                                    <TemplateUpdateFromComposition
                                        template={template}
                                    />
                                </Box>
                            </Tab>
                        </Tabs>
                    </Box>
                </PageLayout>
            ) : (
                <PageLayout contextTitle="Loading..." kind="narrow">
                    <Box gap="medium">
                        <BaseSkeletonBox height={'xsmall'} width={'50%'} />
                        <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                        <PlainSectionDivider />
                        <BaseSkeletonBox height={'xsmall'} width={'70%'} />
                        <BaseSkeletonBox height={'medium'} width={'100%'} />
                    </Box>
                </PageLayout>
            )}
        </>
    )
}

export default EditTemplateUI
