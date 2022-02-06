import { Box, Layer } from 'grommet'

import NavigationButton from '../buttons/NavigationButton'
import { PropsWithChildren } from 'react'
import { X } from 'phosphor-react'

type BaseModalProps = PropsWithChildren<{}> & {
    onClose: () => void
}

const BaseModal = ({ children, onClose }: BaseModalProps) => (
    <Layer
        onClickOutside={onClose}
        onEsc={onClose}
        background="background-popup"
    >
        <Box width={{ min: 'auto' }} pad="medium" round="small">
            <Box alignSelf="end">
                <NavigationButton icon={<X />} onClick={onClose} />
            </Box>
            {children}
        </Box>
    </Layer>
)

export default BaseModal
