import { Box } from 'grommet'
import { Heading } from 'grommet'
import { PropsWithChildren } from 'react'
import { Text } from 'grommet'

type SidebarComponentContainerProps = PropsWithChildren<{}> & {
    title?: string
    description?: string
}

const SidebarComponentContainer = ({
    children,
    title,
    description,
}: SidebarComponentContainerProps) => (
    <Box pad={{ vertical: 'medium' }} gap="medium">
        {(title || description) && (
            <>
                <Heading level="4">{title}</Heading>
                <Text size="small" color="dark-4">
                    {description}
                </Text>
            </>
        )}
        {children}
    </Box>
)

export default SidebarComponentContainer
