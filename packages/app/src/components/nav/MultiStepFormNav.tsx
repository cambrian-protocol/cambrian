import { ArrowLeft, ArrowRight, CloudArrowUp } from 'phosphor-react'
import LoaderButton, { LoaderButtonProps } from '../buttons/LoaderButton'

import { Box } from 'grommet'
import { Button } from 'grommet'

interface MultiStepFormNavProps {
    backward?: () => void
    submitForm?: LoaderButtonProps
}

const MultiStepFormNav = ({ backward, submitForm }: MultiStepFormNavProps) => {
    return (
        <Box>
            <Box direction="row" justify="between">
                {backward ? (
                    <Button
                        type="button"
                        secondary
                        onClick={backward}
                        icon={<ArrowLeft />}
                        size="small"
                        label="Back"
                    />
                ) : (
                    <Box />
                )}
                {submitForm ? (
                    <LoaderButton
                        {...submitForm}
                        icon={<CloudArrowUp />}
                        reverse
                    />
                ) : (
                    <Button
                        size="small"
                        type="submit"
                        primary
                        icon={<ArrowRight />}
                        label="Next"
                        reverse
                    />
                )}
            </Box>
        </Box>
    )
}

export default MultiStepFormNav
