import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalContextHeader from '../proposals/ProposalContextHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import usePermission from '@cambrian/app/hooks/usePermission'

interface AddSolverDataContentProps {
    metadata?: MetadataModel
}

const AddSolverDataContent = ({ metadata }: AddSolverDataContentProps) => {
    const allowed = usePermission('Keeper')
    return (
        <>
            <Box fill justify="center">
                {allowed ? (
                    <Box>
                        <HeaderTextSection
                            title="Initiated Solver"
                            subTitle="Please follow the instructions"
                            paragraph="Add required data and execute this Solver in order to use and interact with it."
                        />
                        {metadata?.stages && (
                            <ProposalContextHeader
                                proposal={
                                    metadata.stages.proposal as ProposalModel
                                }
                                template={
                                    metadata.stages.template as TemplateModel
                                }
                            />
                        )}
                        <Box pad="medium" />
                    </Box>
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
