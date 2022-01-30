import { Box, Nav, Text } from 'grommet'
import {
    ChatCircleText,
    Handshake,
    IconContext,
    PaperPlaneTilt,
} from 'phosphor-react'
import React, { useState } from 'react'

import CommentsModal from '../modals/CommentsModal'
import ReportOutcomeModal from '../modals/ReportOutcomeModal'
import styled from 'styled-components'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'

interface ActiveNavProps {}

const PositionedNav = styled(Nav)`
    position: absolute;
    bottom: 0;
    left: 0;
`

const ActiveNav = ({}: ActiveNavProps) => {
    const { currentUser } = useCurrentUserOrSigner()

    const [
        showReportOutcomeCollectionModal,
        setShowReportOutcomeCollectionModal,
    ] = useState(false)

    const toggleReportOutcomeCollectionModal = () =>
        setShowReportOutcomeCollectionModal(!showReportOutcomeCollectionModal)

    const [showComments, setShowComments] = useState(false)

    const toggleShowComments = () => setShowComments(!showComments)

    return (
        <IconContext.Provider value={{ size: '24' }}>
            <PositionedNav
                width={'100%'}
                direction="row"
                background="veryDark"
                pad="xsmall"
                justify="center"
            >
                <Box direction="row" width="medium" justify="between">
                    <ActiveNavButton
                        icon={<ChatCircleText />}
                        label="Comments"
                        onClick={toggleShowComments}
                    />
                    {currentUser?.role === 'Worker' && (
                        <ActiveNavButton
                            icon={<PaperPlaneTilt />}
                            label="Submit"
                            onClick={() => {}}
                        />
                    )}
                    {currentUser?.role === 'Keeper' && (
                        <ActiveNavButton
                            icon={<Handshake />}
                            label="Report outcome"
                            onClick={toggleReportOutcomeCollectionModal}
                        />
                    )}
                </Box>
            </PositionedNav>
            {showReportOutcomeCollectionModal && (
                <ReportOutcomeModal
                    onClose={toggleReportOutcomeCollectionModal}
                />
            )}
            {showComments && <CommentsModal onClose={toggleShowComments} />}
        </IconContext.Provider>
    )
}

export default ActiveNav

interface ActiveNavButtonProps {
    label: string
    icon: JSX.Element
    onClick: () => void
}

const ActiveNavButton = ({ label, icon, onClick }: ActiveNavButtonProps) => {
    return (
        <Box
            width="small"
            justify="center"
            align="center"
            onClick={onClick}
            gap="xsmall"
            focusIndicator={false}
            pad="small"
            round="small"
        >
            {icon}
            <Text size="xsmall">{label}</Text>
        </Box>
    )
}
