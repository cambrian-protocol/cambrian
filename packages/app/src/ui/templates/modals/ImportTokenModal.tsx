import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Coin } from 'phosphor-react'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { isAddress } from '@cambrian/app/utils/helpers/validation'
import { useState } from 'react'

interface ImportTokenModalProps {
    onClose: () => void
    onAddToken: (token: TokenModel) => boolean
    currentUser: UserType
}

const ImportTokenModal = ({
    onClose,
    currentUser,
    onAddToken,
}: ImportTokenModalProps) => {
    const [tokenAddressInput, setTokenAddressInput] = useState('')
    const [showError, setShowError] = useState(false)
    const [token, setToken] = useState<TokenModel>()

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        if (token !== undefined) {
            if (onAddToken(token)) {
                onClose()
            } else {
                setShowError(true)
            }
        }
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="Import Token"
                icon={<Coin />}
                description="Please insert the ERC20 Contract Address you would like to import"
            />
            <Form onSubmit={onSubmit}>
                <Box height={{ min: 'auto' }} gap="medium">
                    <Box>
                        <Box direction="row" gap="small">
                            <Box flex>
                                <FormField
                                    htmlFor="tokenAddressInput"
                                    label="Token Contract Address"
                                >
                                    <TextInput
                                        name="tokenAddressInput"
                                        value={tokenAddressInput}
                                        onChange={async (e) => {
                                            if (showError) setShowError(false)
                                            setTokenAddressInput(e.target.value)
                                            if (isAddress(e.target.value)) {
                                                setToken(
                                                    await fetchTokenInfo(
                                                        e.target.value,
                                                        currentUser.web3Provider
                                                    )
                                                )
                                            } else {
                                                setToken(undefined)
                                            }
                                        }}
                                    />
                                </FormField>
                            </Box>
                            <TokenAvatar token={token} />
                        </Box>
                    </Box>
                    <Box gap="small">
                        <Button
                            label="Import"
                            type="submit"
                            primary
                            size="small"
                            disabled={!token || showError}
                        />
                        {showError && (
                            <Box align="center">
                                <Text color="status-error" size="small">
                                    This token is already imported
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Form>
        </BaseLayerModal>
    )
}

export default ImportTokenModal
