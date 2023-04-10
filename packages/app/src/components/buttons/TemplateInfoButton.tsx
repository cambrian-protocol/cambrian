import React, { useState } from 'react'

import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { File } from 'phosphor-react'
import ResponsiveButton from './ResponsiveButton'
import TemplateInfoModal from '@cambrian/app/ui/common/modals/TemplateInfoModal'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ITemplateInfoButton {
    denominationToken: TokenModel
    templateDoc: DocumentModel<TemplateModel>
}

const TemplateInfoButton = ({
    denominationToken,
    templateDoc,
}: ITemplateInfoButton) => {
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)
    return (
        <>
            <ResponsiveButton
                label="Template Details"
                icon={<File color={cpTheme.global.colors['dark-4']} />}
                onClick={toggleShowTemplateInfoModal}
            />
            {showTemplateInfoModal && (
                <TemplateInfoModal
                    templateDoc={templateDoc}
                    denominationToken={denominationToken}
                    onClose={toggleShowTemplateInfoModal}
                />
            )}
        </>
    )
}

export default TemplateInfoButton
