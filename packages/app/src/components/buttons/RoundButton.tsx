import { Box, Button, ButtonProps } from 'grommet'

export type RoundButtonProps = ButtonProps & {
    disabled?: boolean
    icon: JSX.Element
    onClick: () => void
}

const RoundButton = ({ disabled, onClick, icon }: RoundButtonProps) => (
    <Box
        round="full"
        overflow="hidden"
        background={disabled ? 'background-contrast' : 'primary-gradient'}
        width={{ min: 'xxsmall' }}
    >
        <Button
            color="white"
            disabled={disabled}
            icon={icon}
            hoverIndicator
            onClick={() => onClick()}
        />
    </Box>
)

export default RoundButton
