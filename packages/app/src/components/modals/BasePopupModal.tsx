import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { Layer } from 'grommet'
import { PropsWithChildren } from 'react'
import { X } from 'phosphor-react'

type BaseModalProps = PropsWithChildren<{}> & {
    title: string
    description: string
    onClose: () => void
}

const BasePopupModal = ({
    title,
    description,
    onClose,
    children,
}: BaseModalProps) => (
    <Layer onEsc={onClose} background={'background-popup'}>
        <Box direction="row">
            <Box onClick={onClose} pad="small" focusIndicator={false}>
                <X size={'24'} />
            </Box>
            <Box flex />
        </Box>
        <Box pad="medium" fill justify="center">
            <HeaderTextSection title={title} paragraph={description} />
            {children}
        </Box>
    </Layer>
)

export default BasePopupModal
