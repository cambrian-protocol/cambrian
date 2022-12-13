import { ArrowUpRight } from 'phosphor-react'
import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import TemplatePreview from '../../templates/TemplatePreview'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplateInfoModalProps {
    stageStack: StageStackType
    onClose: () => void
    collateralToken?: TokenModel
}

const TemplateInfoModal = ({
    stageStack,
    collateralToken,
    onClose,
}: TemplateInfoModalProps) => {
    const [templaterProfile] = useCambrianProfile(stageStack.template.author)
    return (
        <BaseLayerModal onClose={onClose} width="xlarge">
            <Box height={{ min: 'auto' }}>
                <BaseHeader
                    title={stageStack.template.title}
                    metaTitle="Template Solver"
                    authorProfileDoc={templaterProfile}
                    items={[
                        {
                            label: 'Open Template',
                            icon: (
                                <ArrowUpRight
                                    color={cpTheme.global.colors['dark-4']}
                                />
                            ),
                            href: `/solver/${stageStack.proposal.template.streamID}`,
                        },
                    ]}
                />
                <TemplatePreview
                    template={stageStack.template}
                    collateralToken={collateralToken}
                    templaterProfile={templaterProfile}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
