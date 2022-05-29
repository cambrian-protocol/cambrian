import { Question, Shield } from 'phosphor-react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { useState } from 'react'

interface PrepareSolveActionbarProps {
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
}

const PrepareSolveActionbar = ({
    solverMethods,
    solverData,
    currentCondition,
    metadata,
}: PrepareSolveActionbarProps) => {
    const [isPreparing, setIsPreparing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onPrepareSolve = async () => {
        await invokeContractFunction(
            'ChangedStatus',
            () => solverMethods.prepareSolve(0),
            setIsPreparing,
            setErrorMessage,
            'PREPARE_SOLVE_ERROR'
        )
    }

    return (
        <>
            <Actionbar
                primaryAction={
                    <LoaderButton
                        onClick={onPrepareSolve}
                        label="Prepare Solve"
                        isLoading={isPreparing}
                    />
                }
                actionbarItems={[
                    {
                        icon: <Question />,
                        label: 'Help',
                        dropContent: (
                            <ActionbarItemDropContainer
                                title="Prepare Solver"
                                description='Hit the "Prepare Solve"-Button and confirm the transaction to initialize this Solver.'
                                list={[
                                    {
                                        icon: <Shield />,
                                        label: `This can just be done by the Keeper or a parent Solver`,
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
                metadata={metadata}
                solverData={solverData}
                currentCondition={currentCondition}
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

export default PrepareSolveActionbar
