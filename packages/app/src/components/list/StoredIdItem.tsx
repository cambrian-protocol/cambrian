import { ArrowCircleRight, Check, Link as LinkIcon } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseFormContainer from '../containers/BaseFormContainer'
import { Box } from 'grommet'
import { Button } from 'grommet'
import Link from 'next/link'
import { Text } from 'grommet'

interface StoredIdItemProps {
    route?: string
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
                    {link}
                </Text>
            </Box>
            <Box direction="row" flex wrap>
                <Box flex width={{ min: 'small' }} pad="xsmall">
                    <Button
                        label={isSavedToClipboard ? 'Copied!' : 'Copy'}
                        secondary
                        icon={
                            isSavedToClipboard ? (
                                <Check size={'24'} />
                            ) : (
                                <LinkIcon size="24" />
                            )
                        }
                        onClick={() => {
                            navigator.clipboard.writeText(link)
                            setIsSavedToClipboard(true)
                        }}
                    />
                </Box>
                {route && (
                    <Box flex width={{ min: 'small' }} pad="xsmall">
                        <Link href={link} passHref>
                            <Button
                                label="Follow link"
                                reverse
                                primary
                                icon={<ArrowCircleRight size="24" />}
                            />
                        </Link>
                    </Box>
                )}
            </Box>
        </BaseFormContainer>
    )
}

export default StoredIdItem
