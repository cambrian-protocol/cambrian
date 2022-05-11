import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'
import { Info, Plus } from 'phosphor-react'
import { SetStateAction, useState } from 'react'

import { BigNumber } from 'ethers'
import { Box } from 'grommet'
import { CheckBox } from 'grommet'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import PreferredTokenItem from '@cambrian/app/components/list/PreferredTokenItem'
import { Text } from 'grommet'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { validateAddress } from '@cambrian/app/utils/helpers/validation'

interface CreateTemplatePaymentStepProps {
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
    collateralToken?: TokenModel
    setCollateralToken: React.Dispatch<SetStateAction<TokenModel | undefined>>
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
    isCollateralFlex: boolean
    currentUser: UserType
}

type CreateTemplatePaymentStepFormType = {
    askingAmount: number
    denominationTokenAddress: string
    allowAnyPaymentToken: boolean
    preferredTokens: TokenModel[]
}

const CreateTemplatePaymentStep = ({
    input,
    stepperCallback,
    isCollateralFlex,
    setInput,
    currentUser,
    setCollateralToken,
    collateralToken,
}: CreateTemplatePaymentStepProps) => {
    const [paymentInput, setPaymentInput] =
        useState<CreateTemplatePaymentStepFormType>({
            askingAmount: input.askingAmount || 0,
            denominationTokenAddress: input.denominationTokenAddress || '',
            preferredTokens: input.preferredTokens || [],
            allowAnyPaymentToken: input.allowAnyPaymentToken || false,
        })

    const initCollateralToken = async (ctAddress: string) => {
        const token = await fetchTokenInfo(ctAddress, currentUser.web3Provider)
        setCollateralToken(token)
    }

    const onAddPreferredToken = () => {
        const newPreferredToken: TokenModel = {
            address: '',
            decimals: BigNumber.from(18),
            totalSupply: BigNumber.from(0),
        }
        const newPrefferredTokens = [
            ...paymentInput.preferredTokens,
            newPreferredToken,
        ]
        setPaymentInput({
            ...paymentInput,
            preferredTokens: newPrefferredTokens,
        })
    }

    const updatePreferredToken = async (address: string, idx: number) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        if (token) {
            const updatedPreferredTokens = [...paymentInput.preferredTokens]
            updatedPreferredTokens[idx] = token
            setPaymentInput({
                ...paymentInput,
                preferredTokens: updatedPreferredTokens,
            })
        }
    }

    const onRemovePreferredToken = (index: number) => {
        if (
            paymentInput.preferredTokens &&
            paymentInput.preferredTokens.length > 0
        ) {
            setPaymentInput({
                ...paymentInput,
                preferredTokens: paymentInput.preferredTokens.filter(
                    (v, _idx) => _idx !== index
                ),
            })
        }
    }

    let PreferredTokenGroup = null
    if (paymentInput.preferredTokens !== undefined) {
        PreferredTokenGroup = paymentInput.preferredTokens.map(
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

    const onSubmit = (
        e: FormExtendedEvent<CreateTemplatePaymentStepFormType, Element>
    ) => {
        e.preventDefault()
        setInput({ ...input, ...paymentInput })
        if (input.flexInputs.length > 0) {
            stepperCallback(CREATE_TEMPLATE_STEPS.FLEX_INPUTS)
        } else {
            stepperCallback(CREATE_TEMPLATE_STEPS.NOTIFICATION)
        }
    }

    return (
        <Form<CreateTemplatePaymentStepFormType>
            onChange={(nextValue: CreateTemplatePaymentStepFormType) => {
                setPaymentInput(nextValue)
            }}
            value={paymentInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(
                                CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS
                            )
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${3}/${input.flexInputs.length > 0 ? 5 : 4}`}
                    title="Interesting.. and how much will that cost?"
                />
                <Box gap="medium">
                    <>
                        <Box direction="row" fill gap="small" align="center">
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
                                        label="Token Address"
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
                            <Box direction="row" align="center" gap="xsmall">
                                <Info size="24" />
                                <Text size="small" color="dark-4">
                                    Will be used as denomination if alternative
                                    tokens are allowed.
                                </Text>
                            </Box>
                        )}
                    </>
                    {isCollateralFlex && (
                        <Box gap="small">
                            <Box pad={{ vertical: 'small' }}>
                                <CheckBox
                                    name="allowAnyPaymentToken"
                                    label="Allow any token for payment"
                                />
                            </Box>
                            {paymentInput.preferredTokens.length > 0 && (
                                <Text size="small">
                                    Alternative/Preferred token
                                    {paymentInput.preferredTokens.length > 1
                                        ? 's '
                                        : ' '}
                                    which can be used for payment:
                                </Text>
                            )}
                            {PreferredTokenGroup}
                            <FloatingActionButton
                                icon={<Plus />}
                                label="Add Token"
                                onClick={onAddPreferredToken}
                            />
                        </Box>
                    )}
                </Box>
                <Box pad="small" />
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplatePaymentStep
