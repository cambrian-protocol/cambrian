import { Box, Tab, Tabs } from 'grommet'
import { useEffect, useState } from 'react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import TemplateDescriptionForm from './forms/TemplateDescriptionForm'
import TemplateFlexInputsForm from './forms/TemplateFlexInputsForm'
import { TemplateFormType } from './wizard/TemplateWizard'
import TemplatePricingForm from './forms/TemplatePricingForm'
import TemplateRequirementsForm from './forms/TemplateRequirementsForm'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useRouter } from 'next/router'

interface EditTemplateUIProps {
    currentUser: UserType
}
/* 
TODO
Template Header with title
Refactor FlexInputs to controlled Inputs
"Unsaved changes"-warning on Tabswitch
*/
const EditTemplateUI = ({ currentUser }: EditTemplateUIProps) => {
    const [input, setInput] = useState<TemplateFormType>()

    const [isCollateralFlex, setIsCollateralFlex] = useState<boolean>(false)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [hasFlexInputs, setHasFlexInputs] = useState(false)

    const router = useRouter()
    const { templateStreamID } = router.query
    const [currentTemplate, setCurrentTemplate] =
        useState<CeramicTemplateModel>()
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()

    useEffect(() => {
        if (router.isReady) init()
    }, [router, currentUser])

    const init = async () => {
        if (
            templateStreamID !== undefined &&
            typeof templateStreamID === 'string'
        ) {
            try {
                const cs = new CeramicStagehand(currentUser.selfID)
                setCeramicStagehand(cs)

                const template = (await cs.loadStream(
                    templateStreamID
                )) as CeramicTemplateModel

                if (template) {
                    const composition = (await cs.loadStream(
                        template.composition.commitID
                    )) as CompositionModel

                    if (composition) {
                        setCurrentComposition(composition)
                        setInput({
                            title: template.title,
                            description: template.description,
                            askingAmount: template.price?.amount || 0,
                            denominationTokenAddress:
                                template.price?.denominationTokenAddress || '',
                            allowAnyPaymentToken:
                                template.price?.allowAnyPaymentToken || false,
                            preferredTokens:
                                template.price?.preferredTokens || [],
                            flexInputs: template.flexInputs,
                            requirements: template.requirements,
                        })
                        initCollateralToken(
                            template.price?.denominationTokenAddress || ''
                        )

                        composition.solvers.forEach((solver) => {
                            Object.keys(solver.slotTags).forEach((tagId) => {
                                if (solver.slotTags[tagId].isFlex === true) {
                                    if (tagId === 'collateralToken')
                                        setIsCollateralFlex(true)
                                } else {
                                    setHasFlexInputs(true)
                                }
                            })
                        })

                        return setCurrentTemplate(template)
                    }
                }
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShowInvalidQueryComponent(true)
    }

    const initCollateralToken = async (ctAddress: string) => {
        const token = await fetchTokenInfo(ctAddress, currentUser.web3Provider)
        setCollateralToken(token)
    }

    // Display Template
    const onSaveTemplate = async (updatedTemplate: TemplateFormType) => {
        if (ceramicStagehand) {
            try {
                await ceramicStagehand.updateTemplate(
                    templateStreamID as string,
                    updatedTemplate
                )
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            {showInvalidQueryComponent ? (
                <PageLayout contextTitle="Invalid Template">
                    <InvalidQueryComponent context={StageNames.template} />
                </PageLayout>
            ) : currentComposition && currentTemplate ? (
                <Box align="center">
                    <Box width={'xlarge'}>
                        {input && (
                            <Tabs justify="start">
                                <Tab title="Description">
                                    <Box pad="small" />
                                    <TemplateDescriptionForm
                                        input={input}
                                        onSubmit={async (e) => {
                                            const updatedInput = {
                                                ...input,
                                                ...e.value,
                                            }
                                            setInput(updatedInput)
                                            onSaveTemplate(updatedInput)
                                        }}
                                        onCancel={() => init()}
                                        submitLabel="Save"
                                        cancelLabel="Reset"
                                    />
                                </Tab>
                                <Tab title="Pricing">
                                    <Box pad="small" />
                                    <TemplatePricingForm
                                        input={input}
                                        currentUser={currentUser}
                                        collateralToken={collateralToken}
                                        isCollateralFlex={isCollateralFlex}
                                        setCollateralToken={setCollateralToken}
                                        onSubmit={async (e) => {
                                            const updatedInput = {
                                                ...input,
                                                ...e.value,
                                            }
                                            setInput(updatedInput)
                                            onSaveTemplate(updatedInput)
                                        }}
                                        onCancel={() => init()}
                                        submitLabel="Save"
                                        cancelLabel="Reset"
                                    />
                                </Tab>
                                {hasFlexInputs && currentComposition && (
                                    <Tab title="Solver Config">
                                        <Box pad="small" />
                                        <TemplateFlexInputsForm
                                            composition={currentComposition}
                                            input={input}
                                            onSubmit={async (e) => {
                                                const updatedInput = {
                                                    ...input,
                                                    ...e.value,
                                                }
                                                setInput(updatedInput)
                                                onSaveTemplate(updatedInput)
                                            }}
                                            onCancel={() => init()}
                                            submitLabel="Save"
                                            cancelLabel="Reset"
                                        />
                                    </Tab>
                                )}
                                <Tab title="Requirements">
                                    <Box pad="small" />
                                    <TemplateRequirementsForm
                                        input={input}
                                        onSubmit={async (e) => {
                                            const updatedInput = {
                                                ...input,
                                                ...e.value,
                                            }
                                            setInput(updatedInput)
                                            onSaveTemplate(updatedInput)
                                        }}
                                        submitLabel="Save"
                                        onCancel={() => init()}
                                        cancelLabel="Reset"
                                    />
                                </Tab>
                            </Tabs>
                        )}
                    </Box>
                </Box>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default EditTemplateUI
