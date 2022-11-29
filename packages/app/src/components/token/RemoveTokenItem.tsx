import BaseTokenBadge from './BaseTokenBadge'
import { X } from 'phosphor-react'

interface RemoveTokenItemProps {
    tokenAddress: string
    onRemove: (removedToken: string) => void
}

const RemoveTokenItem = ({ tokenAddress, onRemove }: RemoveTokenItemProps) => {
    return (
        <BaseTokenBadge
            icon={<X />}
            tokenAddress={tokenAddress}
            onClick={() => onRemove(tokenAddress)}
        />
    )
}

export default RemoveTokenItem
