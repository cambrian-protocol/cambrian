import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CoinVertical } from 'phosphor-react'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import randimals from 'randimals'
import router from 'next/router'
import { usePublicRecord } from '@self.id/framework'

interface ViewTemplateUIProps {
    templateStreamID: string
    template: CeramicTemplateModel
    currentUser: UserType
}

// TODO Diplay preferred/alternative Tokens
const ViewTemplateUI = ({
    templateStreamID,
    template,
    currentUser,
}: ViewTemplateUIProps) => {
    const sellerBasicProfile = usePublicRecord('basicProfile', template.author)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        if (template.price?.denominationTokenAddress) {
            const ct = await fetchTokenInfo(
                template.price?.denominationTokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            const { streamID } = await ceramicStagehand.createProposal(
                randimals(),
                templateStreamID
            )
            router.push(
                `${window.location.origin}/dashboard/proposals/new/${streamID}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsCreatingProposal(false)
        }
    }
    return (
        <>
            <Box
                pad="large"
                height={{ min: '90vh' }}
                justify="center"
                direction="row"
            >
                <Box width={'large'} gap="medium">
                    <Heading level="2">{template.title}</Heading>
                    <Box direction="row" align="center" gap="medium">
                        <BaseAvatar
                            pfpPath={
                                sellerBasicProfile.content?.avatar as string
                            }
                        />
                        <Box>
                            <Heading level="4">
                                {sellerBasicProfile.content?.name}
                            </Heading>
                            <Text size="small" color="dark-4">
                                {sellerBasicProfile.content?.title as string}
                            </Text>
                        </Box>
                    </Box>
                    <PlainSectionDivider />
                    <Heading level="3">About this Template</Heading>
                    <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                        {template.description}
                    </Text>
                    {template.requirements.trim() !== '' && (
                        <Box gap="medium">
                            <Heading level="4">Requirements</Heading>
                            <Text
                                color="dark-4"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {template.requirements}
                            </Text>
                        </Box>
                    )}
                    <PlainSectionDivider />
                    <Heading level="3">About the Seller</Heading>
                    <Box direction="row" gap="medium" align="center">
                        <BaseAvatar
                            pfpPath={
                                sellerBasicProfile.content?.avatar as string
                            }
                            size="medium"
                        />
                        <Box>
                            <Heading level="3">
                                {sellerBasicProfile.content?.name}
                            </Heading>
                            <Text size="small" color="dark-4">
                                {sellerBasicProfile.content?.title as string}
                            </Text>
                        </Box>
                    </Box>
                    <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                        {sellerBasicProfile.content?.description}
                    </Text>
                </Box>
                <Box pad={{ left: 'medium' }}>
                    <Box
                        width={'medium'}
                        pad="medium"
                        border
                        round="xsmall"
                        gap="medium"
                    >
                        <Text>The seller quotes:</Text>
                        <Box direction="row" gap="small" justify="center">
                            <Heading level="2">
                                {template.price?.amount}
                            </Heading>
                            <TokenAvatar token={collateralToken} />
                        </Box>
                        {template.price?.allowAnyPaymentToken && (
                            <Box direction="row" align="center" gap="small">
                                <CoinVertical size="24" />
                                <Text size="small">
                                    The seller allows payment with any other
                                    token
                                </Text>
                            </Box>
                        )}
                        <LoaderButton
                            onClick={onCreateProposal}
                            isLoading={isCreatingProposal}
                            size="small"
                            primary
                            label="Create Proposal"
                        />
                    </Box>
                </Box>
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ViewTemplateUI
