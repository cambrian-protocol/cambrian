import {
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { CTFContext } from '@cambrian/app/store/CTFContext'
import { UserContext, UserType } from '@cambrian/app/store/UserContext'
import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BigNumber, ethers } from 'ethers'
import { Handshake } from 'phosphor-react'
import { useContext, useEffect, useState } from 'react'
const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

interface RedeemTokensActionbarProps {
    solverData: SolverContractData
    solverChain: string[]
}

const RedeemTokensActionbar = ({
    solverData,
    solverChain,
}: RedeemTokensActionbarProps) => {
    // TODO Fetch token and amount for signer
    // TODO Redeem token functionality
    const ctf = useContext(CTFContext)
    const user = useContext(UserContext)

    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [totalPayout, setTotalPayout] = useState<number>()

    useEffect(() => {
        getCollateralToken()
    }, [])

    useEffect(() => {
        if (ctf && user.currentUser && solverData) {
            getTotalPayout(ctf, user.currentUser, solverData)
        } else {
            console.log(ctf, user.currentUser, solverData)
        }
    }, [ctf])

    /**
     * Get collateralToken info for display next to totalPayout
     */
    const getCollateralToken = async () => {
        const token = await TokenAPI.getTokenInfo(
            solverData.config.conditionBase.collateralToken
        )
        console.log(token)
        setCollateralToken(token)
    }

    /**
     * Calculates (from on-chain data) the total payout in collateral from all conditions in all solvers
     * Sorry, I know this is gross right now
     *
     **** Balances and payoutMultiplier arrays are shape [Solver[Condition[OutcomeCollection]]
     **** TODO: Needs refactoring & testing on outcome collections containing >1 outcome
     */
    const getTotalPayout = async (
        ctf: ethers.Contract,
        currentUser: UserType,
        solverData: SolverContractData
    ) => {
        const conditions2Deep: SolverContractCondition[][] = await Promise.all(
            solverChain.map((address) =>
                new ethers.Contract(
                    address,
                    new ethers.utils.Interface(SOLVER_ABI),
                    currentUser.signer
                ).getConditions()
            )
        )

        const collectionIds3Deep: string[][][] = await Promise.all(
            conditions2Deep.map((conditions) =>
                Promise.all(
                    conditions.map((condition) =>
                        Promise.all(
                            solverData.config.conditionBase.partition.map(
                                (indexSet) =>
                                    ctf.getCollectionId(
                                        condition.parentCollectionId,
                                        condition.conditionId,
                                        indexSet
                                    )
                            )
                        )
                    )
                )
            )
        )

        const positionIds3Deep: string[][][] = await Promise.all(
            collectionIds3Deep.map((collectionIds2Deep) =>
                Promise.all(
                    collectionIds2Deep.map((collectionIds) =>
                        Promise.all(
                            collectionIds.map((collectionId) =>
                                ctf.getPositionId(
                                    solverData.config.conditionBase
                                        .collateralToken,
                                    collectionId
                                )
                            )
                        )
                    )
                )
            )
        )

        const balances = await Promise.all(
            positionIds3Deep.map((positionIds2Deep) =>
                Promise.all(
                    positionIds2Deep.map((positionIds) =>
                        ctf
                            .balanceOfBatch(
                                new Array(positionIds.length).fill(
                                    currentUser.address
                                ),
                                positionIds
                            )
                            .then((arr: BigNumber[]) =>
                                arr.map((x) => x.toString())
                            )
                    )
                )
            )
        )

        const payoutMultipliers = await Promise.all(
            conditions2Deep.map((conditions) =>
                Promise.all(
                    conditions.map((condition) =>
                        getPayoutMultipliers(
                            ctf,
                            condition.conditionId,
                            solverData.config.conditionBase.outcomeSlots
                        )
                    )
                )
            )
        )

        let totalPayout = calcTotalPayout(balances, payoutMultipliers)

        console.log(balances)
        console.log(payoutMultipliers)
        console.log(totalPayout)

        setTotalPayout(totalPayout)
    }

    /**
     * Each condition must be redeemed independently
     * "Redeem Tokens" action may want to open a modal showing seperate redeemable value for each condition
     */
    const redeemCondition = async (
        ctf: ethers.Contract,
        condition: SolverContractCondition,
        solverData: SolverContractData
    ) => {
        await ctf.redeemPositions(
            solverData.config.conditionBase.collateralToken,
            condition.parentCollectionId,
            condition.conditionId,
            solverData.config.conditionBase.partition
        )
    }

    const calcTotalPayout = (
        balances: number[][][],
        multipliers: number[][][]
    ) => {
        let totalPayout = 0
        balances.forEach((solver, i) => {
            solver.forEach((condition, j) => {
                condition.forEach((position, k) => {
                    if (multipliers[i][j][k] != 0) {
                        totalPayout =
                            totalPayout + position / multipliers[i][j][k]
                    }
                })
            })
        })
        return totalPayout
    }

    /**
     * Payout reports may be linear or categorical
     * Solidity can't handle floats
     * Therefore the conditional token framework tracks numerators and denominators for payout reports
     * Redeemable value of one conditional token (CT) is equal to `1/payoutMultipler`
     */
    const getPayoutMultipliers = async (
        ctf: ethers.Contract,
        conditionId: string,
        outcomeSlots: number
    ) => {
        let promises = []
        for (let i = 0; i < outcomeSlots; i++) {
            promises.push(ctf.payoutNumerators(conditionId, i))
        }

        const numerators = await Promise.all(promises)
        const denominator = await ctf.payoutDenominator(conditionId)

        const multipliers = numerators.map(
            (numerator) => numerator / denominator
        )

        return multipliers
    }

    return (
        <Actionbar
            actions={{
                primaryAction: {
                    onClick: () => {},
                    label: 'Redeem tokens',
                },
                info: {
                    icon: <Handshake />,
                    label: `${totalPayout !== undefined ? totalPayout : '?'} ${
                        collateralToken
                            ? collateralToken.symbol || collateralToken.name
                            : 'Tokens'
                    }`,
                    descLabel: 'You have earned',
                },
            }}
        />
    )
}

export default RedeemTokensActionbar
