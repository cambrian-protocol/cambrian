import { Box, Text } from 'grommet'

import ClipboardAddress from '@cambrian/app/components/info/ClipboardAddress'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../templates/forms/TemplateFlexInputsForm'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { PropsWithChildren } from 'react'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'

interface FlexInputInfoProps {
    flexInputs: FlexInputFormType[]
    composition: CompositionModel
}

const FlexInputInfo = ({ flexInputs, composition }: FlexInputInfoProps) => {
    const renderFlexInputs = () => {
        const FlexInputs = flexInputs
            .filter((flexInput) => flexInput.value !== '')
            .map((f) => {
                const flexInputType = getFlexInputType(composition.solvers, f)
                if (flexInputType === 'address') {
                    return (
                        <FlexInputInfoContainer key={f.id}>
                            <ClipboardAddress
                                key={f.id}
                                label={f.label}
                                address={f.value}
                            />
                        </FlexInputInfoContainer>
                    )
                } else if (f.id === 'timelockSeconds') {
                    return (
                        <FlexInputInfoContainer key={f.id}>
                            <Text color="dark-4">{f.label}</Text>
                            <Text weight={'bold'} color="brand">
                                {parseSecondsToDisplay(Number(f.value))}
                            </Text>
                        </FlexInputInfoContainer>
                    )
                } else {
                    return (
                        <FlexInputInfoContainer key={f.id}>
                            <Text color="dark-4">{f.label}</Text>
                            <Text weight={'bold'} color="brand">
                                {f.value}
                            </Text>
                        </FlexInputInfoContainer>
                    )
                }
            })

        if (FlexInputs.length > 0) {
            return (
                <Box gap="medium">
                    <PlainSectionDivider />
                    <Box direction="row" wrap>
                        {FlexInputs}
                    </Box>
                </Box>
            )
        }
    }

    return <>{renderFlexInputs()}</>
}

export default FlexInputInfo

const FlexInputInfoContainer = ({ children }: PropsWithChildren<{}>) => (
    <Box
        basis="1/2"
        width={{ min: 'medium' }}
        pad={{ vertical: 'small' }}
        gap="xsmall"
    >
        {children}
    </Box>
)
