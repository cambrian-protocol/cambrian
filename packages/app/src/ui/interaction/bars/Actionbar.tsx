import { Box, Button, ButtonExtendedProps, ResponsiveContext } from 'grommet'

import ActionbarInfo from '@cambrian/app/components/info/ActionbarInfo'

export type ActionbarActionsType = {
    primaryAction?: ButtonExtendedProps
} & (
    | { secondaryAction?: ButtonExtendedProps; info?: never }
    | {
          info?: { icon: JSX.Element; label: string; descLabel: string }
          secondaryAction?: never
      }
)

interface ActionbarProps {
    actions: ActionbarActionsType
}

const Actionbar = ({ actions }: ActionbarProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Box
                    width={screenSize === 'small' ? { min: '100vw' } : '100%'}
                    fill="horizontal"
                    pad="small"
                    align="center"
                    background="background-front"
                    border={{ side: 'top', color: 'background-contrast' }}
                    height={{ min: 'auto' }}
                >
                    <Box
                        width="large"
                        direction="row"
                        align="center"
                        pad={{ horizontal: 'small' }}
                    >
                        {actions.info ? (
                            <Box flex>
                                <ActionbarInfo {...actions.info} />
                            </Box>
                        ) : actions.secondaryAction ? (
                            <Button
                                size="small"
                                secondary
                                {...actions.secondaryAction}
                            />
                        ) : (
                            <Box flex />
                        )}
                        <Box>
                            {actions.primaryAction && (
                                <Button
                                    size="small"
                                    primary
                                    {...actions.primaryAction}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </ResponsiveContext.Consumer>
    )
}

export default Actionbar
