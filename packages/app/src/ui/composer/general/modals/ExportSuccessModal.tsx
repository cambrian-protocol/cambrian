import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { Copy } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Text } from 'grommet'

interface ExportCompositionModalProps {
    title: string
    description: string
    ctaLabel: string
    link: string
    onClose: () => void
    exportedCID: string
}

const ExportSuccessModal = ({
    onClose,
    exportedCID,
    title,
    description,
    link,
    ctaLabel,
}: ExportCompositionModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={title}
                subTitle="Success"
                paragraph={description}
            />
            <BaseFormContainer direction="row" justify="between" align="center">
                <Text truncate>{exportedCID}</Text>
                <Button
                    icon={<Copy size="24" />}
                    onClick={() => {
                        navigator.clipboard.writeText(exportedCID)
                    }}
                />
            </BaseFormContainer>
            <Box fill="horizontal" margin={{ top: 'medium' }}>
                <Button
                    primary
                    label={ctaLabel}
                    href={`${link}/${exportedCID}`}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default ExportSuccessModal
