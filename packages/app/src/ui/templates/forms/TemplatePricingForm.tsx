import {
    Box,
    Button,
    CheckBox,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
} from 'grommet'
import { Info, Plus } from 'phosphor-react'
import { SetStateAction, useEffect, useState } from 'react'

import { BigNumber } from 'ethers'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PreferredTokenItem from '@cambrian/app/components/list/PreferredTokenItem'
import { TemplateFormType } from '../wizard/TemplateWizard'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { validateAddress } from '@cambrian/app/utils/helpers/validation'

interface TemplatePricingFormProps {
    input: TemplateFormType
    collateralToken?: TokenModel
    setCollateralToken: React.Dispatch<SetStateAction<TokenModel | undefined>>
    isCollateralFlex: boolean
    currentUser: UserType
    onSubmit: (
        event: FormExtendedEvent<TemplatePricingFormType, Element>
    ) => Promise<void>
    submitLabel: string
    onCancel: () => void
    cancelLabel: string
}

export type TemplatePricingFormType = {
    askingAmount: number
    denominationTokenAddress: string
    allowAnyPaymentToken: boolean
    preferredTokens: TokenModel[]
}

const TemplatePricingForm = ({
    onSubmit,
    input,
    isCollateralFlex,
    currentUser,
    setCollateralToken,
    collateralToken,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplatePricingFormProps) => {
    const [askingAmount, setAskingAmount] = useState(0)
    const [denominationTokenAddress, setDenominationTokenAddress] = useState('')
    const [allowAnyPaymentToken, setAllowAnyPaymentToken] = useState(false)
    const [preferredTokens, setPreferredTokens] = useState<TokenModel[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setAskingAmount(input.askingAmount)
        setDenominationTokenAddress(input.denominationTokenAddress)
        setAllowAnyPaymentToken(input.allowAnyPaymentToken)
        setPreferredTokens(input.preferredTokens)
    }, [input])

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
        const newPrefferredTokens = [...preferredTokens, newPreferredToken]
        setPreferredTokens(newPrefferredTokens)
    }

    const updatePreferredToken = async (address: string, idx: number) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        if (token) {
            const updatedPreferredTokens = [...preferredTokens]
            updatedPreferredTokens[idx] = token
            setPreferredTokens(updatedPreferredTokens)
        }
    }

    const onRemovePreferredToken = (index: number) => {
        if (preferredTokens && preferredTokens.length > 0) {
            setPreferredTokens(
                preferredTokens.filter((v, _idx) => _idx !== index)
            )
        }
    }

    let PreferredTokenGroup = null
    if (preferredTokens !== undefined) {
        PreferredTokenGroup = preferredTokens.map((preferredToken, idx) => (
            <PreferredTokenItem
                key={idx}
                idx={idx}
                token={preferredToken}
                updateToken={updatePreferredToken}
                onRemove={onRemovePreferredToken}
            />
        ))
    }

    const handleSubmit = async (
        e: FormExtendedEvent<TemplatePricingFormType, Element>
    ) => {
        setIsSubmitting(true)
        await onSubmit(e)
        setIsSubmitting(false)
    }

    return (
        <Form<TemplatePricingFormType> onSubmit={handleSubmit}>
            <Box height={{ min: '60vh' }} justify="between">
                <Box>
                    <HeaderTextSection
                        title="How much does it cost?"
                        paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
                    />
                    <Box gap="medium">
                        <>
                            <Box
                                direction="row"
                                fill
                                gap="small"
                                align="center"
                            >
                                <Box basis="1/4">
                                    <FormField
                                        value={askingAmount}
                                        onChange={(e) =>
                                            setAskingAmount(
                                                parseInt(e.target.value)
                                            )
                                        }
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
                                            value={denominationTokenAddress}
                                            onChange={(event) => {
                                                setDenominationTokenAddress(
                                                    event.target.value
                                                )
                                                initCollateralToken(
                                                    event.target.value
                                                )
                                            }}
                                            validate={validateAddress}
                                        />
                                    </Box>
                                    <TokenAvatar token={collateralToken} />
                                </Box>
                            </Box>
                            {isCollateralFlex && (
                                <Box
                                    direction="row"
                                    align="center"
                                    gap="xsmall"
                                >
                                    <Info size="24" />
                                    <Text size="small" color="dark-4">
                                        Will be used as denomination if
                                        alternative tokens are allowed.
                                    </Text>
                                </Box>
                            )}
                        </>
                        {isCollateralFlex && (
                            <Box gap="small">
                                <Box pad={{ vertical: 'small' }}>
                                    <CheckBox
                                        checked={allowAnyPaymentToken}
                                        onChange={(e) =>
                                            setAllowAnyPaymentToken(
                                                e.target.checked
                                            )
                                        }
                                        name="allowAnyPaymentToken"
                                        label="Allow any token for payment"
                                    />
                                </Box>
                                {preferredTokens.length > 0 && (
                                    <Text size="small">
                                        Alternative/Preferred token
                                        {preferredTokens.length > 1
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
                </Box>
                <Box pad="small" />
                <Box direction="row" justify="between">
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel}
                        onClick={onCancel}
                    />
                    <LoaderButton
                        isLoading={isSubmitting}
                        size="small"
                        primary
                        label={submitLabel}
                        type="submit"
                    />
                </Box>
            </Box>
        </Form>
    )
}

export default TemplatePricingForm
