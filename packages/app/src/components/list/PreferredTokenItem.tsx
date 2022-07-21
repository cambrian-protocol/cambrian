import { Box } from 'grommet'
import { FormField } from 'grommet'
import TokenAvatar from '../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { X } from 'phosphor-react'
import { validateAddress } from '@cambrian/app/utils/helpers/validation'

interface PreferredTokenItemProps {
    idx: number
    token: TokenModel
    onRemove: (idx: number) => void
    updateToken: (value: string, idx: number) => void
}

const PreferredTokenItem = ({
    idx,
    token,
    onRemove,
    updateToken,
}: PreferredTokenItemProps) => {
    return (
        <Box
            animation={'fadeIn'}
            key={idx}
            direction="row"
            gap="small"
            pad="small"
            background={'background-front'}
            align="start"
            round="xsmall"
            elevation="small"
        >
            <Box alignSelf="center">
                <TokenAvatar token={token} />
            </Box>
            <Box flex>
                <FormField
                    label="Token address"
                    name={`preferredTokens[${idx}].address`}
                    required
                    onChange={(event) => updateToken(event.target.value, idx)}
                    validate={validateAddress}
                    value={token.address}
                />
            </Box>
            <Box
                onClick={() => onRemove(idx)}
                justify="center"
                focusIndicator={false}
            >
                <X size="18" />
            </Box>
        </Box>
    )
}

export default PreferredTokenItem
