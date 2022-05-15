import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Spinner,
    TextArea,
} from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DiscordWebhookInput from '@cambrian/app/components/inputs/DiscordWebhookInput'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ExportSuccessModal from '../../composer/general/modals/ExportSuccessModal'
import { FlexInputFormType } from '../../templates/forms/steps/CreateTemplateFlexInputStep'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { Text } from 'grommet'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { WebhookAPI } from '@cambrian/app/services/api/Webhook.api'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { renderFlexInputs } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { storeIdInLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface CreateProposalFormProps {
    composition: CompositionModel
    template: TemplateModel
    templateCID: string
}

export type CreateProposalFormType = {
    name: string
    pfp: string
    title: string
    description: string
    price: number
    tokenAddress: string
    flexInputs: FlexInputFormType[]
    discordWebhook: string
}

const initialInput = {
    name: '',
    pfp: '',
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
    flexInputs: [],
    discordWebhook: '',
}

const CreateProposalForm = ({
    composition,
    template,
    templateCID,
}: CreateProposalFormProps) => {
    const { currentUser, connectWallet } = useCurrentUser()

    const [input, setInput] = useState<CreateProposalFormType>(initialInput)
    const [denominationToken, setDenominationToken] = useState<TokenModel>()
    const [proposalId, setProposalId] = useState<string>()
    const [errorMsg, setErrorMsg] = useState<ErrorMessageType>()
    const [isInTransaction, setIsInTransaction] = useState(false)

    const [showRecentProposalsModal, setShowRecentProposalsModal] =
        useState(false)

    const toggleShowRecentProposalsModal = () =>
        setShowRecentProposalsModal(!showRecentProposalsModal)

    useEffect(() => {
        const updatedInputs = { ...input }
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
    }, [])

    const initDenominationToken = async (address: string) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        setDenominationToken(token)
    }

    const onSubmit = async (event: FormExtendedEvent) => {
        event.preventDefault()
        setIsInTransaction(true)
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

            const stagehand = new Stagehand()
            const response = await stagehand.publishProposal(
                input,
                templateCID,
                currentUser.web3Provider
            )

            if (!response) throw GENERAL_ERROR['IPFS_PIN_ERROR']

            const proposalsHub = new ProposalsHub(
                currentUser.signer,
                currentUser.chainId
            )

            const transaction = await proposalsHub.createSolutionAndProposal(
                response.parsedSolvers[0].collateralToken,
                input.price,
                response.parsedSolvers.map((solver) => solver.config),
                response.cid
            )
            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreateProposal'
            ) // Less fragile to event param changes.
            const proposalId = event?.args && event.args.id

            if (!proposalId) throw GENERAL_ERROR['FAILED_PROPOSAL_DEPLOYMENT']

            if (input.discordWebhook !== '') {
                await WebhookAPI.postWebhook(input.discordWebhook, proposalId)
            }

            storeIdInLocalStorage(
                'proposals',
                templateCID,
                input.title,
                proposalId
            )
            setProposalId(proposalId)
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    // TODO Form Validate Type Error handling, Skeleton Loader integration
    return (
        <>
            <BaseFormContainer>
                <Form<CreateProposalFormType>
                    onChange={(nextValue: CreateProposalFormType) => {
                        setInput(nextValue)
                    }}
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                >
                    <Box gap="medium">
                        <BaseFormGroupContainer groupTitle="Proposal details">
                            <FormField
                                name="name"
                                label="Your/Organization Name"
                            />
                            <FormField name="pfp" label="Avatar URL" />
                            <FormField name="title" label="Title" required />
                            <FormField
                                name="description"
                                label="Description"
                                required
                            >
                                <TextArea
                                    name="description"
                                    rows={5}
                                    resize={false}
                                />
                            </FormField>
                        </BaseFormGroupContainer>
                        {renderFlexInputs(
                            input.flexInputs,
                            composition.solvers,
                            true
                        )}
                        {denominationToken ? (
                            <BaseFormGroupContainer
                                groupTitle="Payment details"
                                gap="medium"
                            >
                                <Box
                                    pad="small"
                                    round="small"
                                    background="background-front"
                                    border
                                    elevation="small"
                                >
                                    {template.price?.allowAnyPaymentToken ||
                                    (template.price?.preferredTokens &&
                                        template.price.preferredTokens.length >
                                            0) ? (
                                        <>
                                            <Text>
                                                The seller quotes an equivalent
                                                of {template.price?.amount}{' '}
                                                {denominationToken.symbol}
                                            </Text>
                                            <Text color="dark-4" size="small">
                                                Please make sure you match the
                                                value if you want to pay with a
                                                different token.
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text>
                                                The seller quotes{' '}
                                                {template.price?.amount}{' '}
                                                {denominationToken.symbol}
                                            </Text>
                                            <Text color="dark-4" size="small">
                                                You can make a counter offer, if
                                                you assume it might be accepted
                                            </Text>
                                        </>
                                    )}
                                </Box>
                                <Box direction="row" gap="small">
                                    <Box width={{ max: 'medium' }}>
                                        <FormField
                                            name="price"
                                            label="Amount"
                                            type="number"
                                            required
                                        />
                                    </Box>
                                    <TokenInput
                                        name="tokenAddress"
                                        denominationToken={denominationToken}
                                        preferredTokens={
                                            template.price?.preferredTokens ||
                                            []
                                        }
                                        disabled={
                                            !template.price
                                                ?.allowAnyPaymentToken
                                        }
                                    />
                                </Box>
                            </BaseFormGroupContainer>
                        ) : (
                            <Spinner />
                        )}
                        <BaseFormGroupContainer groupTitle="Notification">
                            <DiscordWebhookInput name="discordWebhook" />
                        </BaseFormGroupContainer>
                        <Box>
                            {currentUser.signer ? (
                                <Box direction="row" justify="between">
                                    <Button
                                        size="small"
                                        secondary
                                        label="Finished Proposals"
                                        onClick={toggleShowRecentProposalsModal}
                                    />
                                    <LoaderButton
                                        isLoading={isInTransaction}
                                        primary
                                        type="submit"
                                        label="Create Proposal"
                                    />
                                </Box>
                            ) : (
                                <Button
                                    size="small"
                                    primary
                                    label="Connect Wallet"
                                    onClick={connectWallet}
                                />
                            )}
                        </Box>
                    </Box>
                </Form>
            </BaseFormContainer>
            {showRecentProposalsModal && (
                <RecentExportsModal
                    prefix="proposals"
                    route="/proposals/"
                    keyCID={templateCID as string}
                    title="Recent proposals"
                    subTitle="Distribute on of your"
                    paragraph="Warning: These proposal IDs are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentProposalsModal}
                />
            )}
            {proposalId && (
                <ExportSuccessModal
                    keyId={templateCID}
                    prefix="proposals"
                    link="/proposals/"
                    description="This is your Proposal ID. Share it with your community and fund the proposal."
                    title="Proposal created"
                    onClose={() => setProposalId(undefined)}
                />
            )}
            {errorMsg && (
                <ErrorPopupModal
                    errorMessage={errorMsg}
                    onClose={() => setErrorMsg(undefined)}
                />
            )}
        </>
    )
}

export default CreateProposalForm
