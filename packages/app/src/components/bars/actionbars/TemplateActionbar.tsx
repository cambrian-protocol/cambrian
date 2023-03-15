import { Box, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseActionbar from './BaseActionbar'
import ClipboardButton from '../../buttons/ClipboardButton'
import { Coin } from 'phosphor-react'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import LoaderButton from '../../buttons/LoaderButton'
import ProposalService from '@cambrian/app/services/stages/ProposalService'
import Template from '@cambrian/app/classes/stages/Template'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TemplateActionbarProps {
    template: Template
}

const TemplateActionbar = ({ template }: TemplateActionbarProps) => {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            if (!currentUser || !currentUser.cambrianProfileDoc)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const proposalService = new ProposalService()
            const res = await proposalService.createStage(
                currentUser,
                template.doc
            )

            if (!res) throw Error('Failed to create Proposal')

            if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                router.push(`/profile/new/${res.streamID}?target=proposal`)
            } else {
                router.push(
                    `${window.location.origin}/proposal/new/${res.streamID}`
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
                        disabled={!template.content.isActive}
                        size="small"
                        label={
                            template.content.isActive
                                ? 'Create Proposal'
                                : 'Closed for Proposals'
                        }
                        onClick={onCreateProposal}
                    />
                }
                info={{
                    title: `${template.content.price.amount} ${
                        template.denominationToken.symbol || '??'
                    }`,
                    subTitle: "Seller's quote",
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Create a Proposal"
                            description='Hit the "Create Proposal"-Button at your right, define your proposal, offer a price and get your work done.'
                            list={[
                                {
                                    icon: <Coin />,
                                    label: `${template.denominationToken.symbol} Token address`,
                                    description: (
                                        <Box
                                            direction="row"
                                            gap="small"
                                            align="center"
                                        >
                                            <Text size="small" color="dark-4">
                                                {ellipseAddress(
                                                    template.denominationToken
                                                        .address,
                                                    10
                                                )}
                                            </Text>
                                            <ClipboardButton
                                                size="xsmall"
                                                value={
                                                    template.denominationToken
                                                        .address
                                                }
                                            />
                                        </Box>
                                    ),
                                },
                            ]}
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
