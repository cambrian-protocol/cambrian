import { CardFooter } from 'grommet'
import { PropsWithChildren } from 'react'

const SidebarCardFooter = ({ children }: PropsWithChildren<{}>) => {
    return (
        <CardFooter fill="horizontal" justify="end">
            {children}
        </CardFooter>
    )
}

export default SidebarCardFooter
