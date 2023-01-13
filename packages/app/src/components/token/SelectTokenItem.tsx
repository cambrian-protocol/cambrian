import BaseTokenBadge from './BaseTokenBadge'
import { CaretDown } from 'phosphor-react'
import SelectTokenModal from '@cambrian/app/ui/common/modals/SelectTokenModal'
import { useState } from 'react'

interface SelectTokenItemProps {
    tokenAddress: string
    onSelect: (newTokenAddress: string) => void
    preferredTokenList?: string[]
    allowAnyPaymentToken: boolean
}

const SelectTokenItem = ({
    tokenAddress,
    onSelect,
    preferredTokenList,
    allowAnyPaymentToken,
}: SelectTokenItemProps) => {
    const [showSelectTokenModal, setShowSelectTokenModal] = useState(false)
    const toggleShowSelectTokenModal = () =>
        setShowSelectTokenModal(!showSelectTokenModal)

    return (
        <>
            <BaseTokenBadge
                icon={<CaretDown />}
                tokenAddress={tokenAddress}
                onClick={toggleShowSelectTokenModal}
            />
            {showSelectTokenModal && (
                <SelectTokenModal
                    onClose={toggleShowSelectTokenModal}
                    onSelect={onSelect}
                    selectedTokenAddresses={[tokenAddress]}
                    preferredTokenList={preferredTokenList}
                    allowAnyPaymentToken={allowAnyPaymentToken}
                />
            )}
        </>
    )
}
export default SelectTokenItem
