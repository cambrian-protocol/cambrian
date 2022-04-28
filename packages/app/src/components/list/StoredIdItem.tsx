import { ArrowCircleRight, Link } from 'phosphor-react'

import BaseFormContainer from '../containers/BaseFormContainer'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { Text } from 'grommet'

interface StoredIdItemProps {
    route: string
    title: string
    cid: string
    border?: boolean
}

const StoredIdItem = ({ route, title, cid, border }: StoredIdItemProps) => {
    const link = `${route}${cid}`

    return (
        <BaseFormContainer
            gap="xsmall"
            direction="row"
            justify="between"
            border={border}
        >
            <Box>
                <Text>{title}</Text>
                <Text truncate size="small" color="dark-4">
                    https://app.cambrianprotocol.com{link}
                </Text>
            </Box>
            <Box direction="row" justify="end" gap="xsmall" flex="grow">
                <Button
                    secondary
                    icon={<Link size="24" />}
                    onClick={() => {
                        navigator.clipboard.writeText(
                            `https://app.cambrianprotocol.com${link}`
                        )
                    }}
                />
                <Button
                    primary
                    icon={<ArrowCircleRight size="24" />}
                    href={link}
                />
            </Box>
        </BaseFormContainer>
    )
}

export default StoredIdItem
