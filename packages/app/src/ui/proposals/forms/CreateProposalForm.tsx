import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import React, { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ExportSuccessModal from '../../composer/general/modals/ExportSuccessModal'
import { FlexInputFormType } from '../../templates/forms/CreateTemplateForm'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import ReferencedSlotInfo from '@cambrian/app/components/info/ReferencedSlotInfo'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { Text } from 'grommet'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'
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
}

const initialInput = {
    name: '',
    pfp: '',
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
    flexInputs: [],
}

const CreateProposalForm = ({
    composition,
    template,
    templateCID,
}: CreateProposalFormProps) => {
    const { currentUser } = useCurrentUser()
    const [input, setInput] = useState<CreateProposalFormType>(initialInput)
    const [denominationToken, setDenominationToken] = useState<TokenModel>()
    const [proposalId, setProposalId] = useState<string>()
    const [errorMsg, setErrorMsg] = useState<string>()
    const [transactionMsg, setTransactionMsg] = useState<string>()

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
        const token = await fetchTokenInfo(address)
        setDenominationToken(token)
    }

    const onSubmit = async (event: FormExtendedEvent) => {
        event.preventDefault()
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            if (!currentUser)
                throw new Error(
                    'You must connect a wallet in order to create a proposal!'
                )
            const updatedInput = { ...input }
            updatedInput.flexInputs.forEach((flexInput) => {
                if (flexInput.tagId === 'collateralToken') {
                    flexInput.value = input.tokenAddress
                    flexInput.isFlex = false
                }
            })

            const stagehand = new Stagehand()
            const response = await stagehand.publishProposal(input, templateCID)
            if (!response)
                throw new Error('Error while publishing proposal to IPFS')

            const proposalsHub = new ProposalsHub(currentUser.signer)

            const proposalId = await proposalsHub.createSolutionAndProposal(
                response.parsedSolvers[0].collateralToken,
                input.price,
                response.parsedSolvers.map((solver) => solver.config),
                response.cid
            )
            if (!proposalId)
                throw new Error('Error while deploying solution and proposal')

            storeIdInLocalStorage(
                'proposals',
                templateCID,
                input.title,
                proposalId
            )
            setProposalId(proposalId)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
        }
        setTransactionMsg(undefined)
    }

    // TODO Form Validate Type Error handling
    return (
        <>
            {denominationToken && (
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
                                    <FormField
                                        name="title"
                                        label="Title"
                                        required
                                    />
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
                                            template.price.preferredTokens
                                                .length > 0) ? (
                                            <>
                                                <Text>
                                                    The seller quotes an
                                                    equivalent of{' '}
                                                    {template.price?.amount}{' '}
                                                    {denominationToken.symbol}
                                                </Text>
                                                <Text
                                                    color="dark-4"
                                                    size="small"
                                                >
                                                    Please make sure you match
                                                    the value if you want to pay
                                                    with a different token.
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <Text>
                                                    The seller quotes{' '}
                                                    {template.price?.amount}{' '}
                                                    {denominationToken.symbol}
                                                </Text>
                                                <Text
                                                    color="dark-4"
                                                    size="small"
                                                >
                                                    You can make a counter
                                                    offer, if you assume it
                                                    might be accepted
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
                                            denominationToken={
                                                denominationToken
                                            }
                                            preferredTokens={
                                                template.price
                                                    ?.preferredTokens || []
                                            }
                                            disabled={
                                                !template.price
                                                    ?.allowAnyPaymentToken
                                            }
                                        />
                                    </Box>
                                </BaseFormGroupContainer>
                                <Box>
                                    <Button
                                        primary
                                        type="submit"
                                        label="Create Proposal"
                                    />
                                </Box>
                            </Box>
                        </Form>
                    </BaseFormContainer>
                    {proposalId && (
                        <ExportSuccessModal
                            keyId={templateCID}
                            prefix="proposals"
                            link="/proposals/"
                            description="This is your Proposal Id. Share it with your community and fund the proposal."
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
                    {transactionMsg && (
                        <LoadingScreen context={transactionMsg} />
                    )}
                </>
            )}
        </>
    )
}

export default CreateProposalForm
