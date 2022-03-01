import {
    Box,
    Button,
    ButtonExtendedProps,
    ResponsiveContext,
    Spinner,
    Stack,
} from 'grommet'

import ActionbarInfo from '@cambrian/app/components/info/ActionbarInfo'

export type ActionbarActionsType = {
    primaryAction?: ButtonExtendedProps & { isLoading?: boolean }
} & (
    | {
          secondaryAction?: ButtonExtendedProps & { isLoading?: boolean }
          info?: never
      }
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
                                    {...actions.primaryAction}
                                    disabled={
                                        actions.primaryAction.isLoading ||
                                        actions.primaryAction.disabled
                                    }
                                    label={
                                        <Stack anchor="center">
                                            {actions.primaryAction.label}
                                            {actions.primaryAction
                                                .isLoading && (
                                                <Spinner color="light-1" />
                                            )}
                                        </Stack>
                                    }
                                    size="small"
                                    primary
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
