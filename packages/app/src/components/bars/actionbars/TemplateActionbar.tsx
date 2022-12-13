import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseActionbar from './BaseActionbar'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import LoaderButton from '../../buttons/LoaderButton'
import { TemplatePriceModel } from '@cambrian/app/models/TemplateModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TemplateActionbarProps {
    isActive: boolean
    templateStreamID: string
    price: TemplatePriceModel
    collateralToken?: TokenModel
}

const TemplateActionbar = ({
    isActive,
    price,
    templateStreamID,
    collateralToken,
}: TemplateActionbarProps) => {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            if (!currentUser || !currentUser.cambrianProfileDoc)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const ceramicProposalAPI = new CeramicProposalAPI(currentUser)
            const streamID = await ceramicProposalAPI.createProposal(
                randimals(),
                templateStreamID
            )

            if (!streamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                router.push(`/profile/new/${streamID}?target=proposal`)
            } else {
                router.push(
                    `${window.location.origin}/proposal/new/${streamID}`
                )
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsCreatingProposal(false)
        }
    }

    return (
        <>
            <BaseActionbar
                primaryAction={
                    <LoaderButton
                        isLoading={isCreatingProposal}
                        primary
                        disabled={!isActive}
                        size="small"
                        label={
                            isActive
                                ? 'Create Proposal'
                                : 'Closed for Proposals'
                        }
                        onClick={onCreateProposal}
                    />
                }
                info={{
                    title: `${price.amount} ${collateralToken?.symbol || '??'}`,
                    subTitle: "Seller's quote",
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Get this service!"
                            description="Let's get started, create your proposal now and take the first step to getting the service you need."
                        />
                    ),
                }}
            />
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default TemplateActionbar
