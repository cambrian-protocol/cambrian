import { PayoutInfo, getRedeemableAmount } from '../utils/helpers/redeemHelper'
import { useEffect, useState } from 'react'

import { BigNumber } from 'ethers'
import CTFContract from '../contracts/CTFContract'
import { SolverContractCondition } from '../models/ConditionModel'
import { SolverModel } from '../models/SolverModel'
import { UserType } from '../store/UserContext'
import { cpLogger } from '../services/api/Logger.api'

const useRedeem = (
    currentUser: UserType,
    solverData: SolverModel,
    currentCondition: SolverContractCondition
) => {
    const ctf = new CTFContract(currentUser.signer, currentUser.chainId)
    const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>()
    const [redeemedAmount, setRedeemedAmount] = useState<BigNumber>()
    const [isLoaded, setIsLoaded] = useState(false)

    const payoutRedemptionFilter = ctf.contract.filters.PayoutRedemption(
        currentUser.address,
        solverData.config.conditionBase.collateralToken,
        currentCondition.parentCollectionId,
        null,
        null,
        null
    )

    useEffect(() => {
        init()
        return () => {
            ctf.contract.removeListener(
                payoutRedemptionFilter,
                redeemedListener
            )
        }
    }, [])

    const init = async () => {
        try {
            setIsLoaded(false)
            const logs = await ctf.contract.queryFilter(payoutRedemptionFilter)
            const conditionLogs = logs.filter(
                (l) => l.args?.conditionId == currentCondition.conditionId
            )
            ctf.contract.on(payoutRedemptionFilter, redeemedListener)

            if (conditionLogs.length > 0) {
                const amount = conditionLogs
                    .map((l) => l.args?.payout)
                    .filter(Boolean)
                    .reduce((x, y) => {
                        return x + y
                    }, 0)
                setRedeemedAmount(BigNumber.from(amount))
            }
            setPayoutInfo(
                await getRedeemableAmount(
                    currentUser,
                    solverData,
                    currentCondition,
                    ctf.contract
                )
            )
            setIsLoaded(true)
        } catch (e) {
            await cpLogger.pushError(e)
        }
    }

    // TODO Types
    const redeemedListener = (
        redeemer: any,
        collateralToken: any,
        parentCollectionId: any,
        conditionId: any,
        indexSets: any,
        payout: any
    ) => {
        if (conditionId == currentCondition.conditionId) {
            setRedeemedAmount(BigNumber.from(payout))
        }
    }

    return {
        payoutInfo: payoutInfo,
        redeemedAmount: redeemedAmount,
        ctfContract: ctf.contract,
        isLoaded: isLoaded,
    }
}

export default useRedeem
