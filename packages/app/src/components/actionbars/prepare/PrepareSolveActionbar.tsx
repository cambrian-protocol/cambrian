import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/actionbars/BaseActionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { Shield } from 'phosphor-react'
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
            <BaseActionbar
                primaryAction={
                    <LoaderButton
                        onClick={onPrepareSolve}
                        label="Prepare Solve"
                        isLoading={isPreparing}
                    />
                }
                info={{
                    title: 'Prepare Solver',
                    subTitle:
                        'In order to interact with the Solver it must be initialized',
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
