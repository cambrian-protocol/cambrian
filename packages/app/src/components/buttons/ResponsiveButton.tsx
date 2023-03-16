import {
    Button,
    ButtonExtendedProps,
    DropButton,
    DropProps,
    ResponsiveContext,
} from 'grommet'
import ClipboardButton, { ClipboardButtonProps } from './ClipboardButton'

import { ConditionalWrapper } from '../utils/ConditionalWrapper'
import Link from 'next/link'

export type ResponsiveButtonProps =
    | (
          | (ButtonExtendedProps & {
                href?: string
            })
          | ClipboardButtonProps
      ) & {
          dropContent?: JSX.Element
          dropAlign?: {
              top?: 'top' | 'bottom'
              bottom?: 'top' | 'bottom'
              right?: 'left' | 'right'
              left?: 'left' | 'right'
          }
          dropProps?: DropProps
      }

const ResponsiveButton = ({
    href,
    label,
    icon,
    value,
    dropContent,
    dropAlign,
    dropProps,
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
                        {dropContent !== undefined ? (
                            <DropButton
                                dropContent={dropContent}
                                dropAlign={dropAlign}
                                dropProps={dropProps}
                                icon={icon}
                                size="small"
                                color={'dark-4'}
                                label={
                                    screenSize !== 'small' ? label : undefined
                                }
                            />
                        ) : value !== undefined ? (
                            <ClipboardButton
                                {...rest}
                                value={value as string}
                                size="small"
                                color={'dark-4'}
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
