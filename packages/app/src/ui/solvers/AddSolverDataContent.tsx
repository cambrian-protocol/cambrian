import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import usePermission from '@cambrian/app/hooks/usePermission'

interface AddSolverDataContentProps {}

const AddSolverDataContent = ({}: AddSolverDataContentProps) => {
    const allowed = usePermission('Keeper')
    return (
        <>
            <Box fill justify="center">
                {allowed ? (
                    <HeaderTextSection
                        subTitle="This solver is initiated"
                        title="Please follow the instructions"
                        paragraph="Add required data and execute this Solver in order to use and interact with it."
                    />
                ) : (
                    <HeaderTextSection
                        subTitle="Please come back later..."
                        title="Solver not ready yet"
                        paragraph="Required data still needs to be added to the Solver in order to use and interact with it."
                    />
                )}
            </Box>
        </>
    )
}

export default AddSolverDataContent
