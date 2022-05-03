import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { BigNumber } from 'ethers'
import { CheckBox } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DiscordWebhookInput from '@cambrian/app/components/inputs/DiscordWebhookInput'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { Plus } from 'phosphor-react'
import PreferredTokenItem from '@cambrian/app/components/list/PreferredTokenItem'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { Text } from 'grommet'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { WebhookAPI } from '@cambrian/app/services/api/Webhook.api'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { renderFlexInputs } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { storeIdInLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { validateAddress } from '@cambrian/app/utils/helpers/validation'

interface CreateTemplateFormProps {
    composition: CompositionModel
    compositionCID: string
    onFailure: (error?: ErrorMessageType) => void
    onSuccess: () => void
}

export type CreateTemplateFormType = {
    pfp?: string
    name?: string
    title: string
    description: string
    askingAmount: number
    denominationTokenAddress: string // In case of possible alternative tokens - its the token address for which to calculate equivalent value
    preferredTokens: TokenModel[]
    allowAnyPaymentToken: boolean
    flexInputs: FlexInputFormType[]
    discordWebhook: string
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

const initialInput = {
    pfp: '',
    name: '',
    title: '',
    description: '',
    askingAmount: 0,
    denominationTokenAddress: '',
    preferredTokens: [],
    allowAnyPaymentToken: false,
    flexInputs: [] as FlexInputFormType[],
    discordWebhook: '',
}

const CreateTemplateForm = ({
    composition,
    compositionCID,
    onSuccess,
    onFailure,
}: CreateTemplateFormProps) => {
    const { currentUser } = useCurrentUser()
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [input, setInput] = useState<CreateTemplateFormType>(initialInput)
    const [isCollateralFlex, setIsCollateralFlex] = useState<boolean>(false)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        const formFlexInputs = parseFlexInputsToForm()

        let ctAddress = ''
        if (composition.solvers[0].config.collateralToken) {
            ctAddress = composition.solvers[0].config.collateralToken
        } else if (
            currentUser.chainId &&
            SUPPORTED_CHAINS[currentUser.chainId]
        ) {
            ctAddress =
                SUPPORTED_CHAINS[currentUser.chainId].contracts
                    .defaultDenominationToken
        }
        initCollateralToken(ctAddress)

        setInput({
            ...initialInput,
            flexInputs: formFlexInputs,
            denominationTokenAddress: ctAddress,
        })
    }, [])

    const initCollateralToken = async (ctAddress: string) => {
        const token = await fetchTokenInfo(ctAddress, currentUser.web3Provider)
        setCollateralToken(token)
    }

    const parseFlexInputsToForm = (): FlexInputFormType[] => {
        const flexInputs: FlexInputFormType[] = []
        composition.solvers.forEach((solver) => {
            Object.keys(solver.slotTags).forEach((tagId) => {
                if (solver.slotTags[tagId].isFlex === true) {
                    if (tagId === 'collateralToken') {
                        setIsCollateralFlex(true)
                    }
                    flexInputs.push({
                        ...solver.slotTags[tagId],
                        solverId: solver.id,
                        tagId: tagId,
                        value: '',
                    })
                }
            })
        })
        return flexInputs
    }

    const onAddPreferredToken = () => {
        const newPreferredToken: TokenModel = {
            address: '',
            decimals: BigNumber.from(18),
            totalSupply: BigNumber.from(0),
        }
        const newPrefferredTokens = [
            ...input.preferredTokens,
            newPreferredToken,
        ]
        setInput({
            ...input,
            preferredTokens: newPrefferredTokens,
        })
    }

    const onRemovePreferredToken = (index: number) => {
        if (input.preferredTokens && input.preferredTokens.length > 0) {
            setInput({
                ...input,
                preferredTokens: input.preferredTokens.filter(
                    (v, _idx) => _idx !== index
                ),
            })
        }
    }

    const updatePreferredToken = async (address: string, idx: number) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        if (token) {
            const updatedPreferredTokens = [...input.preferredTokens]
            updatedPreferredTokens[idx] = token
            setInput({ ...input, preferredTokens: updatedPreferredTokens })
        }
    }

    let PreferredTokenGroup = null
    if (input.preferredTokens !== undefined) {
        PreferredTokenGroup = input.preferredTokens.map(
            (preferredToken, idx) => (
                <PreferredTokenItem
                    key={idx}
                    idx={idx}
                    token={preferredToken}
                    updateToken={updatePreferredToken}
                    onRemove={onRemovePreferredToken}
                />
            )
        )
    }

    const onSubmit = async (event: FormExtendedEvent) => {
        event.preventDefault()
        try {
            setTransactionMsg(TRANSACITON_MESSAGE['IPFS'])

            const updatedInput = { ...input }
            updatedInput.flexInputs.forEach((flexInput) => {
                let stayFlex = flexInput.value === ''
                if (flexInput.tagId === 'collateralToken') {
                    stayFlex =
                        input.allowAnyPaymentToken ||
                        input.preferredTokens.length > 0

                    flexInput.value = stayFlex
                        ? ''
                        : input.denominationTokenAddress
                }
                flexInput.isFlex = stayFlex
            })

            const stagehand = new Stagehand()
            const templateCID = await stagehand.publishTemplate(
                updatedInput,
                compositionCID,
                currentUser.web3Provider
            )
            if (!templateCID) throw GENERAL_ERROR['IPFS_PIN_ERROR']

            if (input.discordWebhook !== '') {
                await WebhookAPI.postWebhook(input.discordWebhook, templateCID)
            }

            storeIdInLocalStorage(
                'templates',
                compositionCID,
                input.title,
                templateCID
            )
            onSuccess()
        } catch (e) {
            onFailure(await cpLogger.push(e))
        }
        setTransactionMsg(undefined)
    }

    return (
        <>
            <BaseFormContainer>
                <Form<CreateTemplateFormType>
                    onChange={(nextValue: CreateTemplateFormType) => {
                        setInput(nextValue)
                    }}
                    validate="blur"
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                >
                    <Box gap="medium">
                        <BaseFormGroupContainer groupTitle="Template details">
                            <FormField
                                name="name"
                                label="Your/Organization Name"
                            />
                            <FormField name="pfp" label="Avatar URL" />
                            <FormField
                                name="title"
                                label="Template title"
                                required
                            />
                            <FormField
                                name="description"
                                label="Template description"
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
                            composition.solvers
                        )}
                        <BaseFormGroupContainer
                            gap="small"
                            groupTitle="Payment details"
                        >
                            <Box fill>
                                <Box
                                    direction="row"
                                    fill
                                    gap="small"
                                    align="center"
                                >
                                    <Box basis="1/4">
                                        <FormField
                                            name="askingAmount"
                                            label="Amount"
                                            type="number"
                                        />
                                    </Box>
                                    <Box fill direction="row" gap="small">
                                        <Box flex>
                                            <FormField
                                                disabled={!isCollateralFlex}
                                                name="denominationTokenAddress"
                                                label="Collateral Token"
                                                type="string"
                                                onChange={(event) =>
                                                    initCollateralToken(
                                                        event.target.value
                                                    )
                                                }
                                                validate={validateAddress}
                                            />
                                        </Box>
                                        <TokenAvatar token={collateralToken} />
                                    </Box>
                                </Box>
                                {isCollateralFlex && (
                                    <Text size="xsmall" color="dark-4">
                                        Will be used as denomination if
                                        alternative tokens are allowed.
                                    </Text>
                                )}
                            </Box>
                            {isCollateralFlex && (
                                <Box gap="small">
                                    <Box pad={{ vertical: 'small' }}>
                                        <CheckBox
                                            name="allowAnyPaymentToken"
                                            label="Allow payment in any token"
                                        />
                                    </Box>
                                    {input.preferredTokens.length > 0 && (
                                        <Text size="small">
                                            Alternative or preferred token(s)
                                            for payment:
                                        </Text>
                                    )}
                                    {PreferredTokenGroup}
                                    <FloatingActionButton
                                        icon={<Plus />}
                                        label="Add alternative or preferred token"
                                        onClick={onAddPreferredToken}
                                    />
                                </Box>
                            )}
                        </BaseFormGroupContainer>
                        <BaseFormGroupContainer groupTitle="Notification">
                            <DiscordWebhookInput name="discordWebhook" />
                        </BaseFormGroupContainer>
                        <Box>
                            <Button
                                primary
                                type="submit"
                                label="Create Template"
                            />
                        </Box>
                    </Box>
                </Form>
            </BaseFormContainer>
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default CreateTemplateForm
