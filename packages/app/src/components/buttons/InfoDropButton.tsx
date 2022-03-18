import { Box } from 'grommet'
import { DropButton } from 'grommet'
import { Info } from 'phosphor-react'
import { Text } from 'grommet'

interface InfoDropButtonProps {
    info: string
}

const InfoDropButton = ({ info }: InfoDropButtonProps) => {
    return (
        <DropButton
            icon={<Info size={24} />}
            dropAlign={{ top: 'bottom', right: 'right' }}
            dropContent={
                <Box pad="medium" width={{ max: 'medium' }}>
                    <Text size="small">{info}</Text>
                </Box>
            }
        />
    )
}

export default InfoDropButton
