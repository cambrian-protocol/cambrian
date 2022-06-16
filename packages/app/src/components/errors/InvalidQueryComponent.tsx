import { Box } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import HeaderTextSection from '../sections/HeaderTextSection'

interface InvalidQueryComponentProps {
    context: string
}

const InvalidQueryComponent = ({ context }: InvalidQueryComponentProps) => (
    <Box width="large" height={{ min: '90vh' }} pad="large" alignSelf="center">
        <HeaderTextSection
            subTitle={`Nothing found at provided identifier`}
            title="Looks empty here"
            paragraph={`Please double check the ${context} identifier and the chain you're connected with, try again, or check with the ${context} creator if the ${context} was successfully exported.`}
            icon={<CircleDashed />}
        />
    </Box>
)

export default InvalidQueryComponent
