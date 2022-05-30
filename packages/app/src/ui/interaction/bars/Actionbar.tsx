import { Faders, IconContext, Info } from 'phosphor-react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { DropButton } from 'grommet'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalInfoModal from '@cambrian/app/components/modals/ProposalInfoModal'
import { ResponsiveContext } from 'grommet'
import SolverConfigInfo from '../config/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { useState } from 'react'

export type ActionbarItemType = {
    icon: JSX.Element
    label: string
    dropContent?: JSX.Element
    onClick?: () => void
}

interface ActionbarProps {
    primaryAction?: JSX.Element
    actionbarItems?: {
        icon: JSX.Element
        label: string
        dropContent?: JSX.Element
        onClick?: () => void
    }[]
    metadata?: MetadataModel
    solverData: SolverModel
    currentCondition?: SolverContractCondition
}

const Actionbar = ({
    primaryAction,
    actionbarItems,
    metadata,
    solverData,
    currentCondition,
}: ActionbarProps) => {
    const [showSolverConfigInfoModal, setSolverConfigInfoModal] =
        useState(false)
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)
    const toggleShowSolverConfigInfoModal = () =>
        setSolverConfigInfoModal(!showSolverConfigInfoModal)

    const items = actionbarItems ? [...actionbarItems] : []

    if (currentCondition) {
        items.push({
            icon: <Faders />,
            onClick: toggleShowSolverConfigInfoModal,
            label: 'Solver',
        })
    }

    if (metadata) {
        items.push({
            icon: <Info />,
            label: 'Gig',
            onClick: toggleShowProposalInfoModal,
        })
    }

    return (
        <>
            <Box fill="horizontal" height={{ min: 'auto' }}>
                <Box
                    background="background-back"
                    border={{ side: 'top' }}
                    align="center"
                >
                    <ResponsiveContext.Consumer>
                        {(screenSize) => {
                            return (
                                <Box
                                    width="large"
                                    direction="row"
                                    align="center"
                                    pad={
                                        screenSize === 'small'
                                            ? { horizontal: 'small' }
                                            : undefined
                                    }
                                    justify="between"
                                >
                                    <Box direction="row" flex justify="between">
                                        <IconContext.Provider
                                            value={{ size: '32' }}
                                        >
                                            {items.map((item, idx) => {
                                                if (item.onClick) {
                                                    return (
                                                        <Button
                                                            key={idx}
                                                            plain
                                                            onClick={
                                                                item.onClick
                                                            }
                                                            label={
                                                                <Box
                                                                    pad="small"
                                                                    justify="center"
                                                                >
                                                                    {item.icon}
                                                                    <Text
                                                                        size="xsmall"
                                                                        textAlign="center"
                                                                        color={
                                                                            'dark-4'
                                                                        }
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </Text>
                                                                </Box>
                                                            }
                                                        />
                                                    )
                                                } else {
                                                    return (
                                                        <DropButton
                                                            key={idx}
                                                            plain
                                                            label={
                                                                <Box
                                                                    pad="small"
                                                                    justify="center"
                                                                >
                                                                    {item.icon}
                                                                    <Text
                                                                        size="xsmall"
                                                                        textAlign="center"
                                                                        color={
                                                                            'dark-4'
                                                                        }
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </Text>
                                                                </Box>
                                                            }
                                                            dropContent={
                                                                <>
                                                                    {
                                                                        item.dropContent
                                                                    }
                                                                </>
                                                            }
                                                            dropAlign={{
                                                                bottom: 'top',
                                                                left: 'left',
                                                            }}
                                                        />
                                                    )
                                                }
                                            })}
                                        </IconContext.Provider>
                                        <Box />
                                    </Box>
                                    {primaryAction && (
                                        <Box width={{ min: 'auto' }}>
                                            {primaryAction}
                                        </Box>
                                    )}
                                </Box>
                            )
                        }}
                    </ResponsiveContext.Consumer>
                </Box>
            </Box>
            {showProposalInfoModal && metadata?.stages && (
                <ProposalInfoModal
                    onClose={toggleShowProposalInfoModal}
                    metadata={metadata}
                />
            )}
            {showSolverConfigInfoModal && currentCondition && (
                <BaseLayerModal onClose={toggleShowSolverConfigInfoModal}>
                    <SolverConfigInfo
                        solverData={solverData}
                        currentCondition={currentCondition}
                    />
                </BaseLayerModal>
            )}
        </>
    )
}

export default Actionbar
