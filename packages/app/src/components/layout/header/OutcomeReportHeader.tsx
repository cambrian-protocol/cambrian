import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseTokenBadge from '../../token/BaseTokenBadge'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import OutcomeCollectionInfoModal from '@cambrian/app/ui/common/modals/OutcomeCollectionInfoModal'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import _ from 'lodash'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface OutcomeReportHeaderProps {
    proposedOutcome: OutcomeCollectionModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const OutcomeReportHeader = ({
    proposedOutcome,
    solverData,
    currentCondition,
}: OutcomeReportHeaderProps) => {
    const { currentUser } = useCurrentUserContext()
    const [showOutcomeInfoModal, setShowOutcomeInfoModal] = useState(false)
    const [confirmedOutcomeCollection, setConfirmedOutcomeCollection] =
        useState<OutcomeCollectionModel>()

    const toggleShowOutcomeInfoModal = () =>
        setShowOutcomeInfoModal(!showOutcomeInfoModal)

    const getRedeemableAmount = (outcomeCollection: OutcomeCollectionModel) =>
        outcomeCollection.allocations.find(
            (allocation) =>
                decodeData(
                    [SolidityDataTypes.Address],
                    allocation.addressSlot.slot.data
                ) === currentUser?.address
        )?.amount

    const redeemableAmount = confirmedOutcomeCollection
        ? getRedeemableAmount(confirmedOutcomeCollection)
        : getRedeemableAmount(proposedOutcome)

    useEffect(() => {
        if (currentUser) fetchPayoutFromCTF()
    }, [currentUser, currentCondition])

    const fetchPayoutFromCTF = async () => {
        if (currentUser && currentUser.signer && currentUser.chainId) {
            const conditionalTokenFrameworkContract = new CTFContract(
                currentUser.signer,
                currentUser.chainId
            )
            const logs =
                await conditionalTokenFrameworkContract.contract.queryFilter(
                    conditionalTokenFrameworkContract.contract.filters.ConditionResolution(
                        currentCondition.conditionId
                    )
                )

            const reportedBinaryArray = logs[0].args?.payoutNumerators
            const indexSet = getIndexSetFromBinaryArray(reportedBinaryArray)

            const _reportedOutcomeCollection = solverData.outcomeCollections[
                currentCondition.conditionId
            ].find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            if (_reportedOutcomeCollection) {
                setConfirmedOutcomeCollection(_reportedOutcomeCollection)
            }
        }
    }

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <>
                            {screenSize === 'small' ? (
                                <Box
                                    border={{ color: 'brand', size: '2px' }}
                                    round="xsmall"
                                    pad={{ vertical: 'medium' }}
                                    background="primary-gradient"
                                    gap="medium"
                                >
                                    <Box
                                        gap="medium"
                                        justify="center"
                                        pad={{ horizontal: 'medium' }}
                                        direction="row"
                                    >
                                        <Box>
                                            <Text size="small" color="dark-4">
                                                {confirmedOutcomeCollection
                                                    ? 'Confirmed'
                                                    : 'Proposed'}
                                            </Text>
                                            <Heading level="3">Outcome</Heading>
                                        </Box>
                                        <Box
                                            direction="row"
                                            align="center"
                                            gap="small"
                                            justify="between"
                                            width={{ min: 'auto' }}
                                            flex
                                            pad={{
                                                right: 'xsmall',
                                                left: 'medium',
                                            }}
                                            border={{ side: 'left' }}
                                        >
                                            <Box>
                                                {/* TODO clean up */}
                                                {confirmedOutcomeCollection
                                                    ? confirmedOutcomeCollection.outcomes.map(
                                                          (outcome, idx) => (
                                                              <Text>
                                                                  {
                                                                      outcome.title
                                                                  }
                                                              </Text>
                                                          )
                                                      )
                                                    : proposedOutcome.outcomes.map(
                                                          (outcome, idx) => (
                                                              <Text>
                                                                  {
                                                                      outcome.title
                                                                  }
                                                              </Text>
                                                          )
                                                      )}
                                            </Box>
                                            <Button
                                                secondary
                                                label="More..."
                                                size="small"
                                                onClick={
                                                    toggleShowOutcomeInfoModal
                                                }
                                            />
                                        </Box>
                                    </Box>
                                    <Box
                                        flex
                                        justify="between"
                                        direction="row"
                                        align="center"
                                        gap="small"
                                        pad={{ horizontal: 'medium' }}
                                    >
                                        <Box width={'small'}>
                                            <Text color="dark-4" size="small">
                                                {confirmedOutcomeCollection
                                                    ? "You're eglible to redeem:"
                                                    : "You'll be eglible to redeem:"}
                                            </Text>
                                        </Box>
                                        <Box
                                            direction="row"
                                            gap="small"
                                            align="center"
                                            width={{ min: 'auto' }}
                                        >
                                            <Heading level={'2'}>
                                                {Number(
                                                    ethers.utils.formatUnits(
                                                        redeemableAmount || 0,
                                                        solverData
                                                            .collateralToken
                                                            .decimals
                                                    )
                                                ) / 10000}
                                            </Heading>
                                            <BaseTokenBadge
                                                token={
                                                    solverData.collateralToken
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    border={{ color: 'brand', size: '2px' }}
                                    round="xsmall"
                                    pad={{ vertical: 'medium' }}
                                    background="primary-gradient"
                                    direction="row"
                                    justify="between"
                                >
                                    <Box
                                        gap="medium"
                                        justify="center"
                                        pad={{ horizontal: 'medium' }}
                                    >
                                        <Box>
                                            <Text size="small" color="dark-4">
                                                {confirmedOutcomeCollection
                                                    ? 'Confirmed'
                                                    : 'Proposed'}
                                            </Text>
                                            <Heading level="3">Outcome</Heading>
                                        </Box>
                                    </Box>
                                    <Box
                                        direction="row"
                                        align="center"
                                        justify="between"
                                        width={{ min: 'auto' }}
                                        flex
                                        border={{ side: 'vertical' }}
                                        wrap
                                    >
                                        <Box
                                            pad={{
                                                horizontal: 'medium',
                                                vertical: 'small',
                                            }}
                                        >
                                            {/* TODO clean up */}
                                            {confirmedOutcomeCollection
                                                ? confirmedOutcomeCollection.outcomes.map(
                                                      (outcome, idx) => (
                                                          <Text>
                                                              {outcome.title}
                                                          </Text>
                                                      )
                                                  )
                                                : proposedOutcome.outcomes.map(
                                                      (outcome, idx) => (
                                                          <Text>
                                                              {outcome.title}
                                                          </Text>
                                                      )
                                                  )}
                                            {confirmedOutcomeCollection &&
                                                !_.isEqual(
                                                    confirmedOutcomeCollection,
                                                    proposedOutcome
                                                ) && (
                                                    <Box
                                                        align="center"
                                                        direction="row"
                                                        gap="small"
                                                    >
                                                        <Text
                                                            size="xsmall"
                                                            color="dark-4"
                                                        >
                                                            The confirmed
                                                            outcome differs from
                                                            the proposed outcome
                                                            due to the
                                                            intervention of the
                                                            arbitration process.
                                                        </Text>
                                                    </Box>
                                                )}
                                        </Box>
                                        <Box
                                            pad={{
                                                horizontal: 'medium',
                                                vertical: 'small',
                                            }}
                                            align="end"
                                        >
                                            <Button
                                                secondary
                                                label="More..."
                                                size="small"
                                                onClick={
                                                    toggleShowOutcomeInfoModal
                                                }
                                            />
                                        </Box>
                                    </Box>
                                    <Box
                                        direction="row"
                                        align="center"
                                        gap="small"
                                        pad={{ horizontal: 'medium' }}
                                    >
                                        <Box width={'small'}>
                                            <Text color="dark-4" size="small">
                                                {confirmedOutcomeCollection
                                                    ? "You're eglible to redeem:"
                                                    : "You'll be eglible to redeem:"}
                                            </Text>
                                        </Box>
                                        <Box
                                            direction="row"
                                            gap="small"
                                            align="center"
                                            width={{ min: 'auto' }}
                                        >
                                            <Heading level={'2'}>
                                                {Number(
                                                    ethers.utils.formatUnits(
                                                        redeemableAmount || 0,
                                                        solverData
                                                            .collateralToken
                                                            .decimals
                                                    )
                                                ) / 10000}
                                            </Heading>
                                            <BaseTokenBadge
                                                token={
                                                    solverData.collateralToken
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </>
                    )
                }}
            </ResponsiveContext.Consumer>
            {showOutcomeInfoModal && (
                <OutcomeCollectionInfoModal
                    onClose={toggleShowOutcomeInfoModal}
                    proposedOutcome={proposedOutcome}
                    collateralToken={solverData.collateralToken}
                    confirmedOutcome={confirmedOutcomeCollection}
                />
            )}
        </>
    )
}

export default OutcomeReportHeader
