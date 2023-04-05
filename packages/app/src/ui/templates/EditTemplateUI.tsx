import { Box, Tab, Tabs } from 'grommet'
import { useContext, useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import EditTemplateHeader from '@cambrian/app/components/layout/header/EditTemplateHeader'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import TemplateUpdateFromComposition from './forms/TemplateUpdateFromComposition'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import _ from 'lodash'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

export type TemplateInputType = Pick<
    TemplateModel,
    | 'title'
    | 'description'
    | 'price'
    | 'flexInputs'
    | 'requirements'
    | 'composition'
>

export const initialTemplateInput: TemplateInputType = {
    title: '',
    description: '',
    price: {
        allowAnyPaymentToken: false,
        amount: '',
        denominationTokenAddress: '',
        isCollateralFlex: false,
        preferredTokens: [],
    },
    flexInputs: [],
    requirements: '',
    composition: { commitID: '', streamID: '' },
}

const EditTemplateUI = () => {
    const { template } = useTemplateContext()
    const [activeIndex, setActiveIndex] = useState(0)
    const [templateInput, setTemplateInput] =
        useState<TemplateInputType>(initialTemplateInput)

    useEffect(() => {
        if (template)
            setTemplateInput({
                title: template.content.title,
                description: template.content.description,
                flexInputs: template.content.flexInputs,
                price: template.content.price,
                requirements: template.content.requirements,
                composition: template.content.composition,
            })
    }, [template])

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
                        <EditTemplateHeader
                            template={template}
                            templateInput={templateInput}
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
                                <TemplateDescriptionForm
                                    templateInput={templateInput}
                                    setTemplateInput={setTemplateInput}
                                />
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
                                <TemplatePricingForm
                                    templateInput={templateInput}
                                    setTemplateInput={setTemplateInput}
                                />
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
                                        templateInput={templateInput}
                                        setTemplateInput={setTemplateInput}
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
                                <TemplateRequirementsForm
                                    templateInput={templateInput}
                                    setTemplateInput={setTemplateInput}
                                />
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
                                    />
                                    <TemplateUpdateFromComposition
                                        templateInput={templateInput}
                                        setTemplateInput={setTemplateInput}
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
