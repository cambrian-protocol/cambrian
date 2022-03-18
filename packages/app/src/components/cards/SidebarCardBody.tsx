import { BoxExtendedProps } from 'grommet'
import { CardBody } from 'grommet'
import { PropsWithChildren } from 'react'

const SidebarCardBody = ({
    children,
    ...rest
}: PropsWithChildren<{}> & BoxExtendedProps) => {
    return (
        <CardBody {...rest} pad="medium" gap="medium">
            {children}
        </CardBody>
    )
}

export default SidebarCardBody
