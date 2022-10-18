import BaseSolverInfo, { OutcomeCollectionInfoType } from './BaseSolverInfo'
import { Lock, Vault } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseListItemButton from '../../buttons/BaseListItemButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import TokenAvatar from '../../avatars/TokenAvatar'
import { UserType } from '@cambrian/app/store/UserContext'
import { getCurrentEscrow } from '../../solver/SolverGetters'
import { getOutcomeCollectionsInfosFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface SolverContractInfoProps {
    contractSolverData: SolverModel
    contractCondition: SolverContractCondition
}

const SolverContractInfo = ({
    contractSolverData,
    contractCondition,
}: SolverContractInfoProps) => {
    const { currentUser } = useCurrentUserContext()
    const [currentEscrow, setCurrentEscrow] = useState<string>()
    const [outcomeCollectionsInfo, setOutcomeCollectionsInfo] =
        useState<OutcomeCollectionInfoType[]>()

    useEffect(() => {
        if (currentUser) init(currentUser)
    }, [currentUser])

    const init = async (user: UserType) => {
        setCurrentEscrow(
            await getCurrentEscrow(user, contractSolverData, contractCondition)
        )

        setOutcomeCollectionsInfo(
            getOutcomeCollectionsInfosFromContractData(
                contractSolverData.outcomeCollections[
                    contractCondition.conditionId
                ],
                contractSolverData.collateralToken
            )
        )
    }

    return (
        <BaseSolverInfo
            token={contractSolverData.collateralToken}
            solverTag={contractSolverData.solverTag}
            outcomeCollections={outcomeCollectionsInfo}
        >
            <BaseListItemButton
                info={
                    contractSolverData.slotTags
                        ? contractSolverData.slotTags['collateralToken']
                              ?.description
                        : undefined
                }
                title="Token used at this Solver"
                icon={
                    <TokenAvatar token={contractSolverData.collateralToken} />
                }
            />
            <BaseListItemButton
                title="Escrow Balance"
                icon={<Vault />}
                subTitle={
                    currentEscrow
                        ? `${currentEscrow}  ${
                              contractSolverData.collateralToken.symbol ||
                              contractSolverData.collateralToken.name ||
                              ''
                          }`
                        : '0'
                }
            />
            <BaseListItemButton
                info={
                    contractSolverData.slotTags
                        ? contractSolverData.slotTags['timelockSeconds']
                              ?.description
                        : undefined
                }
                title="Time to disagree"
                icon={<Lock />}
                subTitle={parseSecondsToDisplay(
                    contractSolverData.config.timelockSeconds
                )}
            />
            {/*  <BaseListItemButton
                info={
                    contractSolverData.slotTags
                        ? contractSolverData.slotTags['arbitrator']?.description
                        : undefined
                }
                title="Arbitrator"
                icon={
                    <BaseAvatar
                        address={contractSolverData.config.arbitrator}
                    />
                }
                subTitle={contractSolverData.config.arbitrator}
            /> */}
        </BaseSolverInfo>
    )
}

export default SolverContractInfo
