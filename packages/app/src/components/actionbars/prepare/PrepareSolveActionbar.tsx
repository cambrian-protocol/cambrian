import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'

interface PrepareSolveActionbarProps {
    solverMethods: GenericMethods
}

const PrepareSolveActionbar = ({
    solverMethods,
}: PrepareSolveActionbarProps) => {
    // TODO Transaction Loader
    const onPrepareSolve = async () => {
        await solverMethods.prepareSolve(0)
    }

    return (
        <Actionbar
            actions={{
                primaryAction: {
                    label: 'Prepare Solve',
                    onClick: onPrepareSolve,
                },
                info: {
                    icon: <Info />,
                    descLabel: 'Info',
                    label: 'Click Prepare Solve to continue',
                },
            }}
        />
    )
}

export default PrepareSolveActionbar
