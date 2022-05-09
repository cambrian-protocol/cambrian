import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalContextHeader from '../proposals/ProposalContextHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface InitiatedSolverContentProps {
    metadata?: MetadataModel
}

const InitiatedSolverContent = ({ metadata }: InitiatedSolverContentProps) => {
    return (
        <>
            <Box fill justify="center">
                <Box>
                    <HeaderTextSection
                        subTitle="Initiated Solver"
                        title="Solver almost ready"
                        paragraph="A few steps need to be done before we can start interacting."
                    />
                    {metadata?.stages && (
                        <ProposalContextHeader
                            proposal={metadata.stages.proposal as ProposalModel}
                            template={metadata.stages.template as TemplateModel}
                        />
                    )}
                    <Box pad="medium" />
                </Box>
            </Box>
        </>
    )
}

export default InitiatedSolverContent
