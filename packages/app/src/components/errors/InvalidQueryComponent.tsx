import { CircleDashed } from 'phosphor-react'
import HeaderTextSection from '../sections/HeaderTextSection'

interface InvalidQueryComponentProps {
    context: string
}

const InvalidQueryComponent = ({ context }: InvalidQueryComponentProps) => (
    <HeaderTextSection
        subTitle={`Nothing found at provided identifier`}
        title="Looks empty here"
        paragraph={`Please double check the ${context} identifier, try again, or check with the ${context} creator if the ${context} was successfully exported.`}
        icon={<CircleDashed />}
    />
)

export default InvalidQueryComponent
