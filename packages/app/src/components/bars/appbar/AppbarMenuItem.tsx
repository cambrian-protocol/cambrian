import { Button, ResponsiveContext } from 'grommet'

import { IconContext } from 'phosphor-react'
import Link from 'next/link'
import { cpTheme } from '@cambrian/app/theme/theme'

interface AppbarMenuItemProps {
    pathname: string
    label: string
    icon: JSX.Element
}

const AppbarMenuItem = ({ icon, pathname, label }: AppbarMenuItemProps) => {
    let isActive = false
    if (typeof window !== 'undefined') {
        isActive = window.location.pathname === pathname
    }

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <IconContext.Provider
                        value={
                            isActive
                                ? { size: '24' }
                                : {
                                      size: '24',
                                      color: cpTheme.global.colors['dark-4'],
                                  }
                        }
                    >
                        <Link href={pathname} passHref>
                            <Button
                                size="small"
                                icon={icon}
                                active={isActive}
                                label={screenSize !== 'small' && label}
                            />
                        </Link>
                    </IconContext.Provider>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default AppbarMenuItem
