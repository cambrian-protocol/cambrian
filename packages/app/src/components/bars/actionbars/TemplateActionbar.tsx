import ActionbarItemDropContainer, {
    ActionbarItemDropListType,
} from '../../containers/ActionbarItemDropContainer'
import { Box, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import BaseActionbar from './BaseActionbar'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import ClipboardButton from '../../buttons/ClipboardButton'
import { Coin } from 'phosphor-react'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import LoaderButton from '../../buttons/LoaderButton'
import { TemplatePriceModel } from '@cambrian/app/models/TemplateModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

interface TemplateActionbarProps {
    isActive: boolean
    templateStreamID: string
    price: TemplatePriceModel
}

const TemplateActionbar = ({
    isActive,
    price,
    templateStreamID,
}: TemplateActionbarProps) => {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [infoList, setInfoList] = useState<ActionbarItemDropListType>([])

    useEffect(() => {
        init()
    }, [currentUser])

    const init = async () => {
        if (price.denominationTokenAddress && currentUser) {
            const ct = await TokenAPI.getTokenInfo(
                price.denominationTokenAddress,
                currentUser.web3Provider,
                currentUser.chainId
            )
            if (ct) setCollateralToken(ct)
            const infos: ActionbarItemDropListType = [
                {
                    icon: <Coin />,
                    label: `${ct?.symbol} Token address`,
                    description: (
                        <Box direction="row" gap="small" align="center">
                            <Text size="small" color="dark-4">
                                {ellipseAddress(
                                    price.denominationTokenAddress,
                                    10
                                )}
                            </Text>
                            <ClipboardButton
                                size="xsmall"
                                value={price.denominationTokenAddress}
                            />
                        </Box>
                    ),
                },
            ]

            setInfoList(infos)
        }
    }

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']
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
                            title="Create a Proposal"
                            description='Hit the "Create Proposal"-Button at your right, define your proposal, offer a price and get your work done.'
                            list={infoList}
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
