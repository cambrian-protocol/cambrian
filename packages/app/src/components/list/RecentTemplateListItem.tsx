import { Article, UserCircle } from 'phosphor-react'
import { Box, Text } from 'grommet'

import Link from 'next/link'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface RecentTemplateListItemProps {
    template: TemplateModel
    templateStreamID: string
}

const RecentTemplateListItem = ({
    template,
    templateStreamID,
}: RecentTemplateListItemProps) => {
    const [templateAuthor] = useCambrianProfile(template.author)

    return (
        <Link
            href={`${window.location.origin}/solver/${templateStreamID}`}
            passHref
        >
            <Box
                focusIndicator={false}
                border
                round="xsmall"
                pad={{ horizontal: 'medium', vertical: 'small' }}
                gap="xsmall"
            >
                <Box direction="row" gap="small">
                    <Article size="24" />
                    <Text>{template.title}</Text>
                </Box>
                <Box direction="row" gap="medium">
                    <Box direction="row" gap="small" align="center">
                        <UserCircle
                            size="18"
                            color={cpTheme.global.colors['dark-4']}
                        />
                        <Text size="small" color="dark-4">
                            Author: {templateAuthor?.content.name || 'Anon'}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Link>
    )
}

export default RecentTemplateListItem
