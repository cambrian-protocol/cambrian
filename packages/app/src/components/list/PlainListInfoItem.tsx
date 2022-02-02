import { Box, Text, Tip } from 'grommet'

import { ConditionalWrapper } from '@cambrian/app/utils/helpers/ConditionalWrapper'
import { IconContext } from 'phosphor-react'

interface PlainListInfoItemProps {
    label: string
    icon: JSX.Element
    info: string
    showTip?: boolean
}

const PlainListInfoItem = ({
    label,
    icon,
    info,
    showTip,
}: PlainListInfoItemProps) => {
    return (
        <IconContext.Provider value={{ size: '24' }}>
            <ConditionalWrapper
                condition={showTip}
                wrapper={(children) => (
                    <Tip plain content={info}>
                        {children}
                    </Tip>
                )}
            >
                <Box pad="medium" direction="row" align="center" gap="large">
                    <Box width={{ min: 'auto', max: 'auto' }}>{icon}</Box>
                    <Box>
                        <Text>{label}</Text>
                        <Text size="small" color="dark-6" truncate>
                            {info}
                        </Text>
                    </Box>
                </Box>
            </ConditionalWrapper>
        </IconContext.Provider>
    )
}

export default PlainListInfoItem
