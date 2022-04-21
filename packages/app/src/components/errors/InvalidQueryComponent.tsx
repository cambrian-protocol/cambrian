import { Box } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import HeaderTextSection from '../sections/HeaderTextSection'

interface InvalidQueryComponentProps {
    context: string
}

const InvalidQueryComponent = ({ context }: InvalidQueryComponentProps) => (
    <Box fill justify="center" align="center" gap="small" direction="row">
        <Box pad="medium">
            <CircleDashed size="48" />
        </Box>
        <HeaderTextSection
            subTitle={`Nothing found at provided identifier`}
            title="Looks empty here"
            paragraph={`Please double check the ${context} identifier, try again, or check with the ${context} creator if the ${context} was successfully exported.`}
        />
    </Box>
)

export default InvalidQueryComponent
