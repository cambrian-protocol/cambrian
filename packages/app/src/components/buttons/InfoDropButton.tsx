import { Box } from 'grommet'
import { DropButton } from 'grommet'
import { Info } from 'phosphor-react'

interface InfoDropButtonProps {
    dropContent: JSX.Element
}

const InfoDropButton = ({ dropContent }: InfoDropButtonProps) => {
    return (
        <DropButton
            icon={<Info size={24} />}
            dropAlign={{ top: 'bottom', right: 'right' }}
            dropContent={<Box width={{ max: 'medium' }}>{dropContent}</Box>}
        />
    )
}

export default InfoDropButton
