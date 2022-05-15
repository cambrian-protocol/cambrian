import { Card } from 'grommet'
import { PropsWithChildren } from 'react'

const SidebarCard = ({ children }: PropsWithChildren<{}>) => {
    return (
        <Card background="background-contrast" fill>
            {children}
        </Card>
    )
}

export default SidebarCard
