import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { Plus } from 'phosphor-react'
import SelectTokenModal from '@cambrian/app/ui/common/modals/SelectTokenModal'

interface AddTokenItemProps {
    onAddToken: (addedToken: string) => void
    addedTokens: string[]
}

const AddTokenItem = ({ onAddToken, addedTokens }: AddTokenItemProps) => {
    const [addedToken, setAddedToken] = useState<string>('')
    const [showSelectTokenModal, setShowSelectTokenModal] = useState(false)

    const toggleShowSelectTokenModal = () =>
        setShowSelectTokenModal(!showSelectTokenModal)

    useEffect(() => {
        if (addedToken !== '') {
            onAddToken(addedToken)
            setAddedToken('')
        }
    }, [addedToken])

    return (
        <>
            <Box pad={{ right: 'xsmall', vertical: 'xsmall' }}>
                <Box
                    round="xsmall"
                    pad={{ vertical: 'xsmall', horizontal: 'small' }}
                    background={'background-front'}
                    onClick={toggleShowSelectTokenModal}
                    hoverIndicator
                    focusIndicator={false}
                    elevation="small"
                >
                    <Box
                        height={{ min: '32px', max: '32px' }}
                        direction="row"
                        align="center"
                        gap="xsmall"
                    >
                        <Text color="dark-4">Add</Text>
                        <Plus />
                    </Box>
                </Box>
            </Box>
            {showSelectTokenModal && (
                <SelectTokenModal
                    allowAnyPaymentToken
                    onClose={toggleShowSelectTokenModal}
                    onSelect={setAddedToken}
                    selectedTokenAddresses={addedTokens}
                />
            )}
        </>
    )
}

export default AddTokenItem
