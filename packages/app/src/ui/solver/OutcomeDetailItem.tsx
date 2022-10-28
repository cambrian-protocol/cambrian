import { Box, Button, Text } from 'grommet'

import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomeInfoModal from '../common/modals/OutcomeInfoModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { useState } from 'react'

interface OutcomeDetailItemProps {
    outcomeCollection: OutcomeCollectionInfoType
}

const OutcomeDetailItem = ({ outcomeCollection }: OutcomeDetailItemProps) => {
    const [showOutcomeDetailModal, setShowOutcomeDetailModal] =
        useState<OutcomeModel>()

    return (
        <>
            {outcomeCollection.outcomes.map((outcome, idx) => {
                return (
                    <Box
                        key={outcome.id}
                        pad={{
                            vertical: 'small',
                            horizontal: 'medium',
                        }}
                        background="background-front"
                        gap="medium"
                    >
                        <Box
                            direction="row"
                            justify="between"
                            align="end"
                            gap="medium"
                        >
                            <Box>
                                <Text size="small" truncate>
                                    {outcome.title}
                                </Text>
                                <Text size="xsmall" color={'dark-4'}>
                                    {outcome.description.substring(0, 80)}
                                    ...
                                </Text>
                            </Box>
                            <Button
                                size="xsmall"
                                secondary
                                label={'More...'}
                                onClick={() =>
                                    setShowOutcomeDetailModal(outcome)
                                }
                            />
                        </Box>
                        {outcomeCollection.outcomes.length - 1 > idx && (
                            <PlainSectionDivider />
                        )}
                    </Box>
                )
            })}
            {showOutcomeDetailModal && (
                <OutcomeInfoModal
                    outcome={showOutcomeDetailModal}
                    onClose={() => setShowOutcomeDetailModal(undefined)}
                />
            )}
        </>
    )
}

export default OutcomeDetailItem
