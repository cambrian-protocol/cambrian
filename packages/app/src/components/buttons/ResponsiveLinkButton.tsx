import { Button, ResponsiveContext } from 'grommet'

import Link from 'next/link'

type ResponsiveLinkButtonProps = {
    label: string
    icon: JSX.Element
    href: string
}

const ResponsiveLinkButton = ({
    href,
    label,
    icon,
}: ResponsiveLinkButtonProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Link href={href} passHref>
                        <Button
                            size="small"
                            color="dark-4"
                            icon={icon}
                            label={screenSize !== 'small' ? label : undefined}
                        />
                    </Link>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default ResponsiveLinkButton
