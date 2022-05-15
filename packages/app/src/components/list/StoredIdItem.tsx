import { ArrowCircleRight, Check, Link } from 'phosphor-react'
import { useEffect, useState } from 'react'

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
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const link = `${route}${cid}`

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    return (
        <BaseFormContainer justify="between" border={border}>
            <Box width={{ max: 'large' }} pad="xsmall">
                <Text>{title}</Text>
                <Text truncate size="small" color="dark-4">
                    https://app.cambrianprotocol.com{link}
                </Text>
            </Box>
            <Box direction="row" flex wrap>
                <Box flex width={{ min: 'small' }} pad="xsmall">
                    <Button
                        label={isSavedToClipboard ? 'Copied!' : 'Copy link'}
                        secondary
                        icon={
                            isSavedToClipboard ? (
                                <Check size={'24'} />
                            ) : (
                                <Link size="24" />
                            )
                        }
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `https://app.cambrianprotocol.com${link}`
                            )
                            setIsSavedToClipboard(true)
                        }}
                    />
                </Box>
                <Box flex width={{ min: 'small' }} pad="xsmall">
                    <Button
                        label="Follow link"
                        reverse
                        primary
                        icon={<ArrowCircleRight size="24" />}
                        href={link}
                    />
                </Box>
            </Box>
        </BaseFormContainer>
    )
}

export default StoredIdItem
