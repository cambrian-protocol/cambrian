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
        background={disabled ? 'dark-1' : 'brandGradient'}
        width={{ min: 'xxsmall' }}
    >
        <Button
            disabled={disabled}
            icon={icon}
            color="black"
            hoverIndicator
            onClick={() => onClick()}
        />
    </Box>
)

export default RoundButton
