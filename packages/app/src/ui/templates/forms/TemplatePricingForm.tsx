import {
    Box,
    Button,
    CheckBox,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
} from 'grommet'
import {
    CeramicTemplateModel,
    TemplatePriceModel,
} from '@cambrian/app/models/TemplateModel'
import { Info, Plus } from 'phosphor-react'
import { SetStateAction, useEffect, useState } from 'react'

import { BigNumber } from 'ethers'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PreferredTokenItem from '@cambrian/app/components/list/PreferredTokenItem'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'

interface TemplatePricingFormProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    currentUser: UserType
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

// TODO Validation, Preferred Token Input cursor jump bug
const TemplatePricingForm = ({
    onSubmit,
    templateInput,
    setTemplateInput,
    currentUser,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplatePricingFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        init()
        return () => {}
    }, [])

    const init = async () => {
        initCollateralToken(templateInput.price.denominationTokenAddress)
    }

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
        const inputClone = _.cloneDeep(templateInput)
        if (!inputClone.price.preferredTokens) {
            inputClone.price.preferredTokens = [newPreferredToken]
        } else {
            inputClone.price.preferredTokens.push(newPreferredToken)
        }
        setTemplateInput(inputClone)
    }

    const updatePreferredToken = async (address: string, idx: number) => {
        const inputClone = _.cloneDeep(templateInput)
        if (
            inputClone.price.preferredTokens &&
            inputClone.price.preferredTokens[idx]
        ) {
            const token = await fetchTokenInfo(
                address,
                currentUser.web3Provider
            )
            inputClone.price.preferredTokens[idx] = token
            setTemplateInput(inputClone)
        }
    }

    const onRemovePreferredToken = (index: number) => {
        if (
            templateInput.price.preferredTokens &&
            templateInput.price.preferredTokens.length > 0
        ) {
            const inputClone = _.cloneDeep(templateInput)
            inputClone.price.preferredTokens =
                inputClone.price.preferredTokens?.filter(
                    (v, _idx) => _idx !== index
                )
            setTemplateInput(inputClone)
        }
    }

    let PreferredTokenGroup = null
    if (templateInput.price.preferredTokens !== undefined) {
        PreferredTokenGroup = templateInput.price.preferredTokens.map(
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

    const handleSubmit = async (
        event: FormExtendedEvent<TemplatePriceModel, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<TemplatePriceModel> onSubmit={handleSubmit}>
            <Box justify="between" height={{ min: '50vh' }}>
                <Box>
                    <Box direction="row" fill gap="small" align="center">
                        <Box basis="1/4">
                            <FormField
                                label="Amount"
                                type="number"
                                min={0}
                                value={templateInput.price.amount}
                                onChange={(e) =>
                                    setTemplateInput({
                                        ...templateInput,
                                        price: {
                                            ...templateInput.price,
                                            amount:
                                                e.target.value === ''
                                                    ? 0
                                                    : parseInt(e.target.value),
                                        },
                                    })
                                }
                            />
                        </Box>
                        <Box fill direction="row" gap="small">
                            <Box flex>
                                <FormField
                                    disabled={
                                        !templateInput.price.isCollateralFlex
                                    }
                                    label="Token Address"
                                    value={
                                        templateInput.price
                                            .denominationTokenAddress
                                    }
                                    onChange={(e) => {
                                        setTemplateInput({
                                            ...templateInput,
                                            price: {
                                                ...templateInput.price,
                                                denominationTokenAddress:
                                                    e.target.value,
                                            },
                                        })
                                        initCollateralToken(e.target.value)
                                    }}
                                />
                            </Box>
                            <TokenAvatar token={collateralToken} />
                        </Box>
                    </Box>
                    <Box height={{ min: 'auto' }}>
                        {templateInput.price.isCollateralFlex && (
                            <>
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
                                <Box gap="small">
                                    <Box pad={{ vertical: 'small' }}>
                                        <CheckBox
                                            checked={
                                                templateInput.price
                                                    .allowAnyPaymentToken
                                            }
                                            onChange={(e) => {
                                                setTemplateInput({
                                                    ...templateInput,
                                                    price: {
                                                        ...templateInput.price,
                                                        allowAnyPaymentToken:
                                                            e.target.checked,
                                                    },
                                                })
                                            }}
                                            label="Allow any token for payment"
                                        />
                                    </Box>
                                    {templateInput.price.preferredTokens &&
                                        templateInput.price.preferredTokens
                                            .length > 0 && (
                                            <Text size="small">
                                                Alternative/Preferred token
                                                {templateInput.price
                                                    .preferredTokens.length > 1
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
                            </>
                        )}
                    </Box>
                </Box>
                <Box direction="row" justify="between" pad={{ top: 'medium' }}>
                    <Button
                        size="small"
                        secondary
                        label={cancelLabel || 'Reset all changes'}
                        onClick={onCancel}
                    />
                    <LoaderButton
                        isLoading={isSubmitting}
                        size="small"
                        primary
                        label={submitLabel || 'Save'}
                        type="submit"
                    />
                </Box>
            </Box>
        </Form>
    )
}

export default TemplatePricingForm
