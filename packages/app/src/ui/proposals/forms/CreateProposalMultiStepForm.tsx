import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalBuyerStep from './steps/CreateProposalBuyerStep'
import CreateProposalDetailStep from './steps/CreateProposalDetailStep'
import CreateProposalFlexInputStep from './steps/CreateProposalFlexInputStep'
import CreateProposalNotificationStep from './steps/CreateProposalNotificationStep'
import CreateProposalPaymentStep from './steps/CreateProposalPaymentStep'
import CreateProposalStartStep from './steps/CreateProposalStartStep'
import { FlexInputFormType } from '../../templates/forms/steps/CreateTemplateFlexInputStep'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { WebhookAPI } from '@cambrian/app/services/api/Webhook.api'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { storeIdInLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
//@ts-ignore
import randimals from 'randimals'

export type CreateProposalMultiStepFormType = {
    name: string
    pfp: string
    title: string
    description: string
    price: number
    tokenAddress: string
    flexInputs: FlexInputFormType[]
    discordWebhook: string
}

export enum CREATE_PROPOSAL_STEPS {
    START,
    BUYER_DETAILS,
    PROPOSAL_DETAILS,
    FLEX_INPUTS,
    PAYMENT_DETAILS,
    NOTIFICATION,
}

export type CreateProposalMultiStepStepsType =
    | CREATE_PROPOSAL_STEPS.START
    | CREATE_PROPOSAL_STEPS.BUYER_DETAILS
    | CREATE_PROPOSAL_STEPS.PROPOSAL_DETAILS
    | CREATE_PROPOSAL_STEPS.FLEX_INPUTS
    | CREATE_PROPOSAL_STEPS.PAYMENT_DETAILS
    | CREATE_PROPOSAL_STEPS.NOTIFICATION

const initialInput = {
    name: '',
    pfp: '',
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
    flexInputs: [] as FlexInputFormType[],
    discordWebhook: '',
}

interface CreateProposalMultiStepFormProps {
    templateCID: string
    composition: CompositionModel
    template: TemplateModel
    onFailure: (error?: ErrorMessageType) => void
    onSuccess: () => void
}

const CreateProposalMultiStepForm = ({
    composition,
    templateCID,
    template,
    onFailure,
    onSuccess,
}: CreateProposalMultiStepFormProps) => {
    const { currentUser } = useCurrentUser()
    const [input, setInput] =
        useState<CreateProposalMultiStepFormType>(initialInput)
    const [denominationToken, setDenominationToken] = useState<TokenModel>()
    const [currentStep, setCurrentStep] =
        useState<CreateProposalMultiStepStepsType>(CREATE_PROPOSAL_STEPS.START)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    useEffect(() => {
        initInput()
    }, [])

    const initInput = () => {
        const updatedInputs = { ...initialInput }
        // Initialize leftover flexInputs from template
        updatedInputs.flexInputs = template.flexInputs.filter((flexInput) => {
            return flexInput.isFlex
        })
        if (template.price?.denominationTokenAddress) {
            initDenominationToken(template.price.denominationTokenAddress)
        }

        updatedInputs.price = template.price?.amount || 0
        updatedInputs.tokenAddress =
            template.price?.denominationTokenAddress || ''
        setInput(updatedInputs)
    }

    const initDenominationToken = async (address: string) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        setDenominationToken(token)
    }

    const onCreateProposal = async () => {
        try {
            if (!currentUser.signer || !currentUser.chainId)
                throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const updatedInput = { ...input }
            updatedInput.flexInputs.forEach((flexInput) => {
                if (flexInput.tagId === 'collateralToken') {
                    flexInput.value = input.tokenAddress
                    flexInput.isFlex = false
                }
            })

<<<<<<< HEAD
            const stagehand = new CeramicStagehand()
            const proposalStreamID = await stagehand.createProposal(
                randimals(),
=======
            const stagehand = new Stagehand()
            const publishedProposal = await stagehand.publishProposal(
>>>>>>> dev
                input,
                templateCID,
                currentUser
            )

<<<<<<< HEAD
            if (!proposalStreamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
=======
            if (!publishedProposal) throw GENERAL_ERROR['IPFS_PIN_ERROR']
>>>>>>> dev

            //  DON'T GO ON-CHAIN RIGHT AWAY ANYMORE. WE MUST NOTIFY THE TEMPLATE GUY

<<<<<<< HEAD
            // const proposalsHub = new ProposalsHub(
            //     currentUser.signer,
            //     currentUser.chainId
            // )

            // const transaction = await proposalsHub.createSolutionAndProposal(
            //     response.parsedSolvers[0].collateralToken,
            //     input.price,
            //     response.parsedSolvers.map((solver) => solver.config),
            //     response.cid
            // )
            // let rc = await transaction.wait()
            // const event = rc.events?.find(
            //     (event) => event.event === 'CreateProposal'
            // ) // Less fragile to event param changes.
            // const proposalId = event?.args && event.args.id
=======
            const transaction = await proposalsHub.createSolutionAndProposal(
                publishedProposal.parsedSolvers[0].collateralToken,
                input.price,
                publishedProposal.parsedSolvers.map((solver) => solver.config),
                publishedProposal.proposal.solverConfigsCID,
                publishedProposal.cid
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            ) // Less fragile to event param changes.
            const proposalId = event?.args && event.args.id
>>>>>>> dev

            // if (!proposalId) throw GENERAL_ERROR['FAILED_PROPOSAL_DEPLOYMENT']

            // if (input.discordWebhook !== '') {
            //     await WebhookAPI.postWebhook(input.discordWebhook, proposalId)
            // }

            storeIdInLocalStorage(
                'proposals',
                templateCID,
                input.title,
                proposalStreamID
            )

            initInput()
            setCurrentStep(CREATE_PROPOSAL_STEPS.START)

            onSuccess()
        } catch (e) {
            onFailure(await cpLogger.push(e))
        }
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case CREATE_PROPOSAL_STEPS.START:
                return (
                    <CreateProposalStartStep
                        template={template}
                        templateCID={templateCID}
                        input={input}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_PROPOSAL_STEPS.BUYER_DETAILS:
                return (
                    <CreateProposalBuyerStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_PROPOSAL_STEPS.PROPOSAL_DETAILS:
                return (
                    <CreateProposalDetailStep
                        template={template}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_PROPOSAL_STEPS.PAYMENT_DETAILS:
                return (
                    <CreateProposalPaymentStep
                        denominationToken={denominationToken!!}
                        template={template}
                        setInput={setInput}
                        input={input}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_PROPOSAL_STEPS.FLEX_INPUTS:
                return (
                    <CreateProposalFlexInputStep
                        composition={composition}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_PROPOSAL_STEPS.NOTIFICATION:
                return (
                    <CreateProposalNotificationStep
                        createProposal={onCreateProposal}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            default:
                return (
                    <CreateProposalStartStep
                        template={template}
                        templateCID={templateCID}
                        input={input}
                        stepperCallback={setCurrentStep}
                    />
                )
        }
    }
    return (
        <>
            {denominationToken ? (
                <Box height={{ min: '90vh' }} justify="center">
                    {renderCurrentFormStep()}
                </Box>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TOKEN']} />
            )}
        </>
    )
}

export default CreateProposalMultiStepForm
