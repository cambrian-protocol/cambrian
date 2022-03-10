import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Button } from 'grommet'
import { Copy } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Text } from 'grommet'

interface ExportCompositionModalProps {
    onClose: () => void
    exportedCompositionCID: string
}

// TODO Validate composition before export trigger
const ExportCompositionModal = ({
    onClose,
    exportedCompositionCID,
}: ExportCompositionModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Success"
                paragraph="This is your CID for your exported solution. Save it somewhere to have it ready for usage"
            />
            <BaseFormContainer direction="row" justify="between" align="center">
                <Text>{exportedCompositionCID}</Text>
                <Button
                    icon={<Copy size="24" />}
                    onClick={() => {
                        navigator.clipboard.writeText(exportedCompositionCID)
                    }}
                />
            </BaseFormContainer>
        </BaseLayerModal>
    )
}

export default ExportCompositionModal
