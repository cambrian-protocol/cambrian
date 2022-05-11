import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import LoaderButton from '../../buttons/LoaderButton'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { useState } from 'react'

interface PrepareSolveActionbarProps {
    solverMethods: GenericMethods
}

const PrepareSolveActionbar = ({
    solverMethods,
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
                actions={{
                    primaryAction: (
                        <LoaderButton
                            onClick={onPrepareSolve}
                            label="Prepare Solve"
                            isLoading={isPreparing}
                        />
                    ),
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Click Prepare Solve to continue',
                    },
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

export default PrepareSolveActionbar
