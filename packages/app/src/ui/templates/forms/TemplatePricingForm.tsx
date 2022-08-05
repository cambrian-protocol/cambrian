import {
    Box,
    Button,
    CheckBox,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'
import {
    CeramicTemplateModel,
    TemplatePriceModel,
} from '@cambrian/app/models/TemplateModel'
import { Info, Plus } from 'phosphor-react'
import { SetStateAction, useEffect, useState } from 'react'

import DashboardUtilityButton from '@cambrian/app/components/buttons/DashboardUtilityButton'
import ImportTokenModal from '../modals/ImportTokenModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PreferredTokenItem from '@cambrian/app/components/list/PreferredTokenItem'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpTheme } from '@cambrian/app/theme/theme'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { isAddress } from '@cambrian/app/utils/helpers/validation'

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

    const [showImportTokenModal, setShowImportTokenModal] = useState(false)
    const toggleShowImportTokenModal = () =>
        setShowImportTokenModal(!showImportTokenModal)

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

    const onAddPreferredToken = (token: TokenModel) => {
        if (
            token.address === templateInput.price.denominationTokenAddress ||
            templateInput.price.preferredTokens.findIndex(
                (preferredToken) => preferredToken.address === token.address
            ) !== -1
        ) {
            return false
        } else {
            const inputClone = _.cloneDeep(templateInput)
            inputClone.price.preferredTokens.push(token)
            setTemplateInput(inputClone)
            return true
        }
    }

    let PreferredTokenGroup = null
    if (templateInput.price.preferredTokens !== undefined) {
        PreferredTokenGroup = templateInput.price.preferredTokens.map(
            (preferredToken, idx) => (
                <PreferredTokenItem
                    key={idx}
                    idx={idx}
                    templateInput={templateInput}
                    setTemplateInput={setTemplateInput}
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
        <>
            <Form<TemplatePriceModel> onSubmit={handleSubmit}>
                <Box gap="medium" height={{ min: '50vh' }}>
                    <Box pad="xsmall" gap="medium">
                        <Box>
                            <Box fill direction="row" gap="small">
                                <Box basis="1/4">
                                    <FormField
                                        label="Amount"
                                        type="number"
                                        min={0}
                                        step={0.000000001}
                                        name="amount"
                                        value={templateInput.price.amount}
                                        onChange={(e) =>
                                            setTemplateInput({
                                                ...templateInput,
                                                price: {
                                                    ...templateInput.price,
                                                    amount:
                                                        e.target.value === ''
                                                            ? 0
                                                            : Number(
                                                                  e.target.value
                                                              ),
                                                },
                                            })
                                        }
                                    />
                                </Box>
                                <Box
                                    flex
                                    direction="row"
                                    align="start"
                                    gap="small"
                                >
                                    <Box flex>
                                        <FormField
                                            htmlFor="denominationTokenAddress"
                                            label="Token Contract Address"
                                            validate={[
                                                () => {
                                                    if (
                                                        !isAddress(
                                                            templateInput.price
                                                                .denominationTokenAddress
                                                        )
                                                    )
                                                        return 'Invalid Address'
                                                },
                                            ]}
                                        >
                                            <TextInput
                                                name="denominationTokenAddress"
                                                disabled={
                                                    !templateInput.price
                                                        .isCollateralFlex
                                                }
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
                                                    initCollateralToken(
                                                        e.target.value
                                                    )
                                                }}
                                            />
                                        </FormField>
                                    </Box>
                                    <Box pad={{ top: '2.2em' }}>
                                        <TokenAvatar token={collateralToken} />
                                    </Box>
                                </Box>
                            </Box>
                            {templateInput.price.isCollateralFlex && (
                                <Box direction="row" gap="xsmall">
                                    <Info
                                        size="24"
                                        color={cpTheme.global.colors['dark-4']}
                                    />
                                    <Box alignSelf="center">
                                        <Text size="small" color="dark-4">
                                            Will be used as denomination if
                                            alternative tokens are allowed.
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <PlainSectionDivider />
                    </Box>
                    <Box>
                        {templateInput.price.isCollateralFlex && (
                            <>
                                <Box gap="medium">
                                    <Box pad="xsmall" gap="medium">
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
                                        <Text size="small">
                                            Alternative/Preferred token
                                            {templateInput.price.preferredTokens
                                                .length > 1
                                                ? 's '
                                                : ' '}
                                            which can be used for payment:
                                        </Text>
                                    </Box>
                                    <Box wrap direction="row">
                                        {PreferredTokenGroup}
                                        <DashboardUtilityButton
                                            label="Import Token"
                                            primaryIcon={<Plus />}
                                            onClick={toggleShowImportTokenModal}
                                        />
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Box>
                    <Box>
                        <TwoButtonWrapContainer
                            primaryButton={
                                <LoaderButton
                                    isLoading={isSubmitting}
                                    size="small"
                                    primary
                                    label={submitLabel || 'Save'}
                                    type="submit"
                                />
                            }
                            secondaryButton={
                                <Button
                                    size="small"
                                    secondary
                                    label={cancelLabel || 'Reset all changes'}
                                    onClick={onCancel}
                                />
                            }
                        />
                    </Box>
                </Box>
            </Form>
            {showImportTokenModal && (
                <ImportTokenModal
                    currentUser={currentUser}
                    onClose={toggleShowImportTokenModal}
                    onAddToken={onAddPreferredToken}
                />
            )}
        </>
    )
}

export default TemplatePricingForm
