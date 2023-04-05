import { Box, Heading, Text } from 'grommet'

import CambrianProfileInfo from '../../info/CambrianProfileInfo'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { IconContext } from 'phosphor-react'

interface BaseHeaderProps {
    title: string
    metaTitle: string
    statusBadge?: JSX.Element
    items?: JSX.Element[]
    authorProfileDoc?: DocumentModel<CambrianProfileType>
}

const BaseHeader = ({
    items,
    title,
    metaTitle,
    authorProfileDoc,
    statusBadge,
}: BaseHeaderProps) => {
    return (
        <Box
            fill="horizontal"
            height={{ min: 'auto' }}
            pad={{
                top: 'medium',
                bottom: 'xsmall',
            }}
            gap="medium"
        >
            <Box gap="small">
                <Box direction="row" gap="medium" height={'2em'} align="center">
                    <Text color={'brand'}>{metaTitle}</Text>
                    {statusBadge}
                </Box>
                <Heading level="2">{title}</Heading>
            </Box>
            <Box
                direction="row"
                justify="between"
                gap="small"
                border={{ side: 'bottom' }}
                align="end"
                height={'5em'}
            >
                {authorProfileDoc ? (
                    <CambrianProfileInfo
                        cambrianProfileDoc={authorProfileDoc}
                        size="small"
                        role="Author"
                    />
                ) : (
                    <Box />
                )}
                <IconContext.Provider value={{ size: '18' }}>
                    <Box
                        direction="row"
                        gap="xsmall"
                        align="center"
                        pad={{ bottom: 'xsmall' }}
                    >
                        {items?.map((item, idx) => (
                            <Box key={idx}>{item}</Box>
                        ))}
                    </Box>
                </IconContext.Provider>
            </Box>
        </Box>
    )
}

export default BaseHeader
