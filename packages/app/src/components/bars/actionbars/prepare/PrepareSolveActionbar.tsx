import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { Shield } from 'phosphor-react'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface PrepareSolveActionbarProps {
    solverMethods: GenericMethods
}

const PrepareSolveActionbar = ({
    solverMethods,
}: PrepareSolveActionbarProps) => {
    const [isPreparing, setIsPreparing] = useState(false)
    const { showAndLogError } = useErrorContext()

    const onPrepareSolve = async () => {
        setIsPreparing(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.prepareSolve(0)
            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['PREPARE_SOLVE_ERROR']
        } catch (e) {
            showAndLogError(e)
            setIsPreparing(false)
        }
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
        </>
    )
}

export default PrepareSolveActionbar
