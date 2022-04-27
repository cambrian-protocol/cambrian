import { EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ErrorPopupModal from './ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import HeaderTextSection from '../sections/HeaderTextSection'
import LoadingScreen from '../info/LoadingScreen'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface ProposeOutcomeModalProps {
    solverContract: ethers.Contract
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    currentUser: UserType
    updateSolverData: () => Promise<void>
    onBack: () => void
}

const ProposeOutcomeModal = ({
    currentUser,
    solverContract,
    solverMethods,
    solverData,
    currentCondition,
    updateSolverData,
    onBack,
}: ProposeOutcomeModalProps) => {
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()

    const changedStatusFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
        fromBlock: 'latest',
    } as EventFilter

    useEffect(() => {
        solverContract.on(changedStatusFilter, proposedOutcomeListener)
        return () => {
            solverContract.removeListener(
                changedStatusFilter,
                proposedOutcomeListener
            )
        }
    }, [currentUser])

    const proposedOutcomeListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

    const onProposeOutcome = async (indexSet: number) => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )
            await solverMethods.proposePayouts(
                currentCondition.executions - 1,
                binaryArray
            )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <HeaderTextSection title={'Propose an outcome'} />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {solverData.outcomeCollections[
                        currentCondition.conditionId
                    ].map((outcomeCollection, idx) => {
                        return (
                            <OutcomeCollectionCard
                                idx={idx + 1}
                                token={solverData.collateralToken}
                                key={outcomeCollection.indexSet}
                                outcomeCollection={outcomeCollection}
                                proposeMethod={onProposeOutcome}
                            />
                        )
                    })}
                </Box>
            </BaseLayerModal>
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default ProposeOutcomeModal
