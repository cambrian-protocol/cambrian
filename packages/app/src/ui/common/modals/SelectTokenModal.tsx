import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import SelectToken from '@cambrian/app/components/selects/SelectToken'

interface SelectTokenModalProps {
    onClose: () => void
    selectedTokenAddresses: string[]
    onSelect: (newSelectedAddress: string) => void
    preferredTokenList?: string[]
    allowAnyPaymentToken: boolean
}

const SelectTokenModal = ({
    onClose,
    selectedTokenAddresses,
    onSelect,
    preferredTokenList,
    allowAnyPaymentToken,
}: SelectTokenModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <Box gap="small">
                <ModalHeader
                    title="Select a token"
                    description="Search your token by address or select one of the popular tokens below"
                />
                <SelectToken
                    selectedTokenAddresses={selectedTokenAddresses}
                    onSelect={(newSelectedTokenAddress: string) => {
                        onSelect(newSelectedTokenAddress)
                        onClose()
                    }}
                    preferredTokenList={preferredTokenList}
                    allowAnyPaymentToken={allowAnyPaymentToken}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default SelectTokenModal
