import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import ClipboardAddress from '../info/ClipboardAddress'
import { SetStateAction } from 'react'
import TokenAvatar from '../avatars/TokenAvatar'
import { X } from 'phosphor-react'
import _ from 'lodash'

interface PreferredTokenItemProps {
    idx: number
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
}
const PreferredTokenItem = ({
    idx,
    templateInput,
    setTemplateInput,
}: PreferredTokenItemProps) => {
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

    return (
        <Box pad="xsmall">
            <Box
                width={'medium'}
                animation={'fadeIn'}
                direction="row"
                height="xsmall"
                gap="small"
                pad="small"
                background={'background-contrast'}
                align="start"
                round="xsmall"
                elevation="small"
                justify="between"
            >
                <Box alignSelf="center">
                    <TokenAvatar
                        token={templateInput.price.preferredTokens[idx]}
                    />
                </Box>
                <Box alignSelf="center">
                    <ClipboardAddress
                        label="Contract address"
                        address={
                            templateInput.price.preferredTokens[idx].address
                        }
                    />
                </Box>
                <Box
                    onClick={() => onRemovePreferredToken(idx)}
                    justify="center"
                    focusIndicator={false}
                    pad="xsmall"
                >
                    <X size="18" />
                </Box>
            </Box>
        </Box>
    )
}

export default PreferredTokenItem
