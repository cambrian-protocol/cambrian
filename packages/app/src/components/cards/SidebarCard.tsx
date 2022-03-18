import { Card } from 'grommet'
import { PropsWithChildren } from 'react'

const SidebarCard = ({ children }: PropsWithChildren<{}>) => {
    return (
        <Card background="background-front" fill margin={{ right: 'small' }}>
            {children}
        </Card>
    )
}

export default SidebarCard
