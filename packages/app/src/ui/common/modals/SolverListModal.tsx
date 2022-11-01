import { Box, Button, Text } from 'grommet'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import Link from 'next/link'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { SolverInfoType } from '@cambrian/app/components/bars/actionbars/proposal/ProposalExecutedActionbar'
import SolverStatusBadge from '@cambrian/app/components/badges/SolverStatusBadge'
import { ethers } from 'ethers'

interface SolverListModalProps {
    onClose: () => void
    solverInfos: SolverInfoType[]
}

const SolverListModal = ({ solverInfos, onClose }: SolverListModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="Work Solvers"
                description="The following Solvers are deployed by this Proposal."
            />
            {solverInfos.map((solverInfo) => (
                <Link
                    key={solverInfo.address}
                    href={`/solver/${solverInfo.address}`}
                    passHref
                >
                    <Button>
                        <Box pad={'small'} border round="xsmall" gap="xsmall">
                            <Box direction="row" align="center" gap="small">
                                <Text>{solverInfo.data.solverTag?.title}</Text>
                                <SolverStatusBadge
                                    status={
                                        solverInfo.data.conditions[
                                            solverInfo.data.conditions.length -
                                                1
                                        ].status
                                    }
                                />
                            </Box>
                            <Box
                                direction="row"
                                gap="small"
                                align="center"
                                justify="end"
                            >
                                <Text size="small" color="dark-4">
                                    Balance:{' '}
                                    {ethers.utils.formatUnits(
                                        solverInfo.data.collateralBalance,
                                        solverInfo.data.collateralToken.decimals
                                    )}{' '}
                                    {solverInfo.data.collateralToken.symbol}
                                </Text>
                                {solverInfo.data.numMintedTokensByCondition && (
                                    <Text size="small" color="dark-4">
                                        Minted:{' '}
                                        {ethers.utils.formatUnits(
                                            solverInfo.data
                                                .numMintedTokensByCondition[
                                                solverInfo.data.conditions[
                                                    solverInfo.data.conditions
                                                        .length - 1
                                                ].conditionId
                                            ],
                                            solverInfo.data.collateralToken
                                                .decimals
                                        )}{' '}
                                        {solverInfo.data.collateralToken.symbol}
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </Button>
                </Link>
            ))}
        </BaseLayerModal>
    )
}

export default SolverListModal
