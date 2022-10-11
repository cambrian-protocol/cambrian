import { Button, ButtonExtendedProps, ResponsiveContext } from 'grommet'
import ClipboardButton, { ClipboardButtonProps } from './ClipboardButton'

import { ConditionalWrapper } from '../utils/ConditionalWrapper'
import Link from 'next/link'

export type ResponsiveButtonProps =
    | (ButtonExtendedProps & {
          href?: string
      })
    | ClipboardButtonProps

const ResponsiveButton = ({
    href,
    label,
    icon,
    value,
    ...rest
}: ResponsiveButtonProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <ConditionalWrapper
                        condition={href !== undefined}
                        wrapper={(children) => (
                            <Link href={href!} passHref>
                                {children}
                            </Link>
                        )}
                    >
                        {value !== undefined ? (
                            <ClipboardButton
                                {...rest}
                                value={value as string}
                                size="small"
                                label={
                                    screenSize !== 'small' ? label : undefined
                                }
                            />
                        ) : (
                            <Button
                                {...rest}
                                icon={icon}
                                size="small"
                                color={'dark-4'}
                                label={
                                    screenSize !== 'small' ? label : undefined
                                }
                            />
                        )}
                    </ConditionalWrapper>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default ResponsiveButton
