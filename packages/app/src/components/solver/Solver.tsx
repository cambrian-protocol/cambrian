import { BigNumber, Contract, EventFilter, ethers } from 'ethers'
import React, { useContext, useEffect, useState } from 'react'
import {
    RichSlotModel,
    RichSlotsHashMapType,
    SlotModel,
    SlotsHistoryHashMapType,
} from '@cambrian/app/models/SlotModel'
import {
    SolverModel,
    SolverResponseModel,
} from '@cambrian/app/models/SolverModel'

import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import { BaseLayout } from '../layout/BaseLayout'
import { Box } from 'grommet'
import { CTFContext } from '@cambrian/app/store/CTFContext'
import DefaultSolverUI from '@cambrian/app/ui/solvers/DefaultSolverUI'
import ExecuteSolverActionbar from '../actionbars/ExecuteSolverActionbar'
import { Fragment } from 'ethers/lib/utils'
import HeaderTextSection from '../sections/HeaderTextSection'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { JsonFragmentType } from '@ethersproject/abi'
import LoadingScreen from '../info/LoadingScreen'
import { MultihashType } from '@cambrian/app/models/MultihashType'
import { OutcomeCollectionsHashMapType } from '@cambrian/app/models/OutcomeCollectionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TimeLocksHashMapType } from '@cambrian/app/models/TimeLocksHashMapType'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { UserType } from '@cambrian/app/store/UserContext'
import WriterSolverUI from '@cambrian/app/ui/solvers/writerSolverV1/WriterSolverUI'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { ProposalsHubContext } from '@cambrian/app/store/ProposalsHubContext'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

export type BasicSolverMethodsType = {
    prepareSolve: (newConditionIndex: number) => Promise<any>
    executeSolve: (conditionIndex: number) => Promise<any>
    proposePayouts: (conditionIndex: number, payouts: number[]) => Promise<any>
    confirmPayouts: (conditionIndex: number) => Promise<any>
    addData: (slotId: string, data: string) => Promise<any>
    getCollateralBalance: () => Promise<number>
    getChainParent: () => Promise<any>
    getChainChild: () => Promise<any>
    getSolverChain: () => Promise<string[]>
    getChainIndex: () => {}
    getTimelock: (conditionIndex: number) => Promise<any>
    getTrackingID: () => {}
    getUIUri: () => {}
    getData: (slotId: string) => any
    getCurrentSlots: (ingests: SlotModel[]) => Promise<any[] | undefined>
    getCondition: (index: number) => any
    getConditions: () => {}
    getConfig: () => {}
    getManualInputs: (condition: SolverContractCondition) => RichSlotModel[]
    getManualSlots: () => RichSlotModel[]
    getRecipientSlots: (condition: SolverContractCondition) => RichSlotModel[]
}

interface SolverProps {
    address: string
    abi: (string | Fragment | JsonFragmentType)[]
    currentUser: UserType
}

type MetadataModel = {
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel
    proposal?: ProposalModel
}

const Solver = ({ address, abi, currentUser }: SolverProps) => {
    const ctf = useContext(CTFContext)
    const proposalsHub = useContext(ProposalsHubContext)
    const ipfs = new IPFSAPI()
    const contract = new ethers.Contract(
        address,
        new ethers.utils.Interface(abi),
        currentUser.signer
    )
    const [initialized, setInitialized] = useState(false)
    const [isDeployed, setIsDeployed] = useState<boolean | undefined>(undefined)

    const [isLoading, setIsLoading] = useState(false)

    const [currentSolverData, setCurrentSolverData] = useState<SolverModel>()

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()

    const [metadata, setMetadata] = useState<MetadataModel>({
        slotTags: {},
        solverTag: {
            title: 'Solver',
            description: '',
            version: '',
            banner: '',
            avatar: '',
        },
    })

    useEffect(() => {
        if (ctf && proposalsHub && contract && ipfs && !initialized) {
            setInitialized(true)
            init()
        }
    }, [ctf, contract, ipfs])

    const init = async () => {
        initListeners()

        const deployed = await hasDeployedCode()
        if (deployed) {
            setIsDeployed(true)
            await getMetadataFromProposal()
            triggerUpdate()
        } else {
            setIsDeployed(false)
        }
    }

    /**
     * TrackingID is set to ProposalID when deployed from ProposalsHub
     * TODO, extract this logic elsewhere so that Solvers are not dependent on Proposals
     */
    const getMetadataFromProposal = async () => {
        const metadata = {} as any

        try {
            const proposalId = await contract.trackingId()
            const metadataRes = await proposalsHub.getMetadata(proposalId)
            if (metadataRes) {
                const stagehand = new Stagehand()
                const stages = await stagehand.loadStages(
                    metadataRes.templateCID,
                    StageNames.proposal
                )
                const composition = stages?.composition as
                    | CompositionModel
                    | undefined

                if (stages?.proposal) {
                    metadata.proposal = stages.proposal
                }

                if (stages?.composition) {
                    const solverIndex =
                        (await basicSolverMethods.getChainIndex()) as
                            | number
                            | undefined
                    if (solverIndex !== undefined) {
                        metadata.slotTags =
                            composition?.solvers[solverIndex].slotTags || false
                        metadata.solverTag =
                            composition?.solvers[solverIndex].solverTag || false
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }

        setMetadata(metadata)
    }

    const hasDeployedCode = async () => {
        const code = await contract.provider.getCode(contract.address)
        if (code && code != '0x') {
            return true
        } else {
            return false
        }
    }

    const initListeners = async () => {
        const ingestedDataFilter = {
            address: address,
            topics: [ethers.utils.id('IngestedData()')],
            fromBlock: 'latest',
        } as EventFilter

        contract.on(ingestedDataFilter, async () => {
            console.log('Heard IngestedData event')
            triggerUpdate()
            setIsLoading(false)
        })

        const changedStatusFilter = {
            address: address,
            topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
            fromBlock: 'latest',
        } as EventFilter

        contract.on(changedStatusFilter, async () => {
            console.log('Heard ChangedStatus event')
            triggerUpdate()
            setIsLoading(false)
        })
    }

    const triggerUpdate = async () => {
        const updatedData = await getUpdatedData()
        setCurrentSolverData(updatedData)
        if (currentCondition === undefined) {
            setCurrentCondition(
                updatedData.conditions[updatedData.conditions.length - 1]
            )
        }

        if (!isDeployed) {
            setIsDeployed(true)
        }
    }

    const addData = async (slotId: string, data: string) => {
        setIsLoading(true)
        try {
            await contract.addData(slotId, data)
        } catch (e) {
            setIsLoading(false)
            console.log(e)
        }
    }

    const getCollateralBalance = async () => {
        try {
            return contract.collateralBalance()
        } catch (e) {
            console.log(e)
        }
    }

    const getUpdatedData = async (): Promise<SolverModel> => {
        const config = await getConfig()
        const conditions = await getConditions()

        const slotsHistory = await getSlotsHistory(
            config.ingests,
            conditions,
            metadata.slotTags || {}
        )

        const numMintedTokensByCondition =
            await getNumMintedTokensForConditions(
                conditions,
                config.conditionBase.collateralToken
            )

        const collateralToken = await TokenAPI.getTokenInfo(
            config.conditionBase.collateralToken
        )
        const outcomeCollections = await getOutcomeCollections(
            config,
            conditions,
            slotsHistory,
            metadata.slotTags || {},
            numMintedTokensByCondition
        )

        const timelocksHistory = await getTimelocksHistory(conditions)

        const collateralBalance = await getCollateralBalance()
        // TODO right solver index for tags / solver

        console.log('SlotsHistory:', slotsHistory)
        console.log('Available SlotTags:', metadata.slotTags || {})
        return {
            config: config,
            conditions: conditions,
            timelocksHistory: timelocksHistory,
            outcomeCollections: outcomeCollections,
            slotsHistory: slotsHistory,
            numMintedTokensByCondition: numMintedTokensByCondition,
            collateralBalance: collateralBalance,
            collateralToken: collateralToken,
            solverTag: metadata.solverTag || {
                title: 'Solver',
                description: '',
                version: '',
                banner: '',
                avatar: '',
            }, // TODO, why is this necessary?
            slotTags: metadata.slotTags || {},
        }
    }

    const prepareSolve = async (newConditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.prepareSolve(newConditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const executeSolve = async (conditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.executeSolve(conditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const proposePayouts = async (
        conditionIndex: number,
        payouts: number[]
    ) => {
        setIsLoading(true)
        try {
            await contract.proposePayouts(conditionIndex, payouts)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const confirmPayouts = async (conditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.confirmPayouts(conditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    /***************** ******* *******************/
    /***************** GETTERS *******************/
    /***************** ******* *******************/
    const getChainParent = async () => {
        try {
            return contract.chainParent()
        } catch (e) {
            console.error(e)
        }
    }

    const getChainChild = () => {
        try {
            return contract.chainChild()
        } catch (e) {
            console.error(e)
        }
    }

    const getSolverChain = async () => {
        const children = await fetchSolverChain(getChainChild)
        const parents = await fetchSolverChain(getChainParent)

        return [...children, contract.address, ...parents]
    }

    const fetchSolverChain = async (getMethod: () => Promise<any>) => {
        const addresses: string[] = []
        let fetchedAddress = await getMethod()
        while (
            fetchedAddress !== '0x0000000000000000000000000000000000000000' &&
            ethers.utils.isAddress(fetchedAddress)
        ) {
            addresses.push(fetchedAddress)
            const childContract = new ethers.Contract(
                fetchedAddress,
                new ethers.utils.Interface(abi),
                currentUser.signer
            )
            fetchedAddress = await childContract.getChainParent()
        }
        return addresses
    }

    const getChainIndex = async () => {
        try {
            return contract.chainIndex()
        } catch (e) {
            console.error(e)
        }
    }

    const getTimelock = async (index: number) => {
        try {
            return await contract.timelocks(index)
        } catch (e) {
            console.error(e)
        }
    }

    const getTrackingID = async () => {
        try {
            return contract.trackingId()
        } catch (e) {
            console.error(e)
        }
    }

    const getUIUri = async () => {
        try {
            return contract.uiURI()
        } catch (e) {
            console.error(e)
        }
    }

    const getData = async (slotId: string) => {
        try {
            return contract.getData(slotId)
        } catch (e) {
            console.error(e)
        }
    }

    const getCurrentSlots = async (ingests: SlotModel[]) => {
        try {
            return Promise.all(ingests.map((x) => getData(x.slot)))
        } catch (e) {
            console.error(e)
        }
    }

    const getCondition = async (index: number) => {
        try {
            return contract.conditions(index)
        } catch (e) {
            console.error(e)
        }
    }

    const getConditions = async (): Promise<SolverContractCondition[]> => {
        try {
            const res: Omit<SolverContractCondition, 'executions'>[] =
                await contract.getConditions()

            return res.map((condition, idx) => {
                return {
                    ...condition,
                    payouts: condition.payouts.map((x) => Number(x.toString())),
                    executions: idx + 1,
                }
            })
        } catch (e) {
            console.error(e)
            return Promise.reject()
        }
    }

    const getConfig = async (): Promise<SolverConfigModel> => {
        try {
            const res: SolverResponseModel = await contract.getConfig()

            const parsedIngests = res.ingests.map((ingest) => {
                return {
                    ...ingest,
                    executions: ingest.executions.toNumber(),
                    solverIndex: ingest.solverIndex.toNumber(),
                }
            })

            const parsedPartition = res.conditionBase.partition.map(
                (indexSet) => indexSet.toNumber()
            )
            const parsedCondition = {
                ...res.conditionBase,
                partition: parsedPartition,
            }

            return {
                ...res,
                ingests: parsedIngests,
                conditionBase: parsedCondition,
            }
        } catch (e) {
            console.error(e)
            return Promise.reject()
        }
    }

    const calculatePositionId = (
        collateralTokenAddress: string,
        collectionId: string
    ) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['address', 'bytes32'],
                [collateralTokenAddress, collectionId]
            )
        )
    }

    const calculateCollectionId = (conditionId: string, indexSet: number) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'uint256'],
                [conditionId, indexSet]
            )
        )
    }

    const getTimelocksHistory = async (
        conditions: SolverContractCondition[]
    ): Promise<TimeLocksHashMapType> => {
        const timeLocksHashMap: TimeLocksHashMapType = {}
        conditions.forEach(async (condition, idx) => {
            const timelock = await getTimelock(idx)
            timeLocksHashMap[condition.conditionId] = timelock.toNumber()
        })

        return timeLocksHashMap
    }

    const getOutcomeCollections = async (
        config: SolverConfigModel,
        conditions: SolverContractCondition[],
        slotHistory: SlotsHistoryHashMapType,
        slotTags: SlotTagsHashMapType,
        numMintedTokensByCondition?: {
            [conditionId: string]: BigNumber
        }
    ): Promise<OutcomeCollectionsHashMapType> => {
        const outcomeCollectionsHashMap: OutcomeCollectionsHashMapType = {}

        const outcomeURIs = config.conditionBase.outcomeURIs.map(
            (multiHash: MultihashType) => getMultihashFromBytes32(multiHash)
        )

        const outcomes = (await Promise.all(
            outcomeURIs.map((outcomeURI: string | null) => {
                if (outcomeURI) return ipfs.getFromCID(outcomeURI)
            })
        )) as OutcomeModel[]

        conditions.forEach((condition) => {
            outcomeCollectionsHashMap[condition.conditionId] =
                config.conditionBase.partition.map((indexSet, idx) => {
                    const outcomeCollection: OutcomeModel[] = []
                    const binaryArray = binaryArrayFromIndexSet(
                        indexSet,
                        config.conditionBase.outcomeSlots
                    )
                    binaryArray.forEach((binary, idx) => {
                        if (binary === 1) {
                            outcomeCollection.push(outcomes[idx])
                        }
                    })
                    const allocations: AllocationModel[] =
                        config.conditionBase.allocations.map((allocation) => {
                            const addressSlot =
                                slotHistory[condition.conditionId][
                                    allocation.recipientAddressSlot
                                ]
                            const amountSlot =
                                slotHistory[condition.conditionId][
                                    allocation.recipientAmountSlots[idx]
                                ]

                            const amountPercentage = BigNumber.from(
                                decodeData(
                                    [SolidityDataTypes.Uint256],
                                    amountSlot.slot.data
                                )
                            ).div(100)

                            const amount =
                                numMintedTokensByCondition &&
                                numMintedTokensByCondition[
                                    condition.conditionId
                                ].toString() !== '0'
                                    ? amountPercentage
                                          .mul(
                                              numMintedTokensByCondition[
                                                  condition.conditionId
                                              ]
                                          )
                                          .div(100)
                                    : undefined

                            const positionId = calculatePositionId(
                                config.conditionBase.collateralToken,
                                calculateCollectionId(
                                    condition.conditionId,
                                    indexSet
                                )
                            )

                            return {
                                addressSlot:
                                    addressSlot ||
                                    getIngestWithMetaData(
                                        allocation.recipientAddressSlot,
                                        config.ingests,
                                        slotTags
                                    ),
                                amountPercentage: amountPercentage.toString(),
                                positionId: positionId,
                                amount: amount,
                            }
                        })

                    return {
                        indexSet: indexSet,
                        outcomes: outcomeCollection,
                        allocations: allocations,
                    }
                })
        })

        return outcomeCollectionsHashMap
    }

    // Improvement - reference by conditionId instead of executions
    const getSlotsHistory = async (
        ingests: SlotModel[],
        conditions: SolverContractCondition[],
        slotTags: SlotTagsHashMapType
    ): Promise<SlotsHistoryHashMapType> => {
        const slotsHistory: SlotsHistoryHashMapType = {}
        const currentSlotData = await Promise.all(
            ingests.map(async (ingest: SlotModel) => {
                const dataArr: any[] = await contract.getAllData(ingest.slot)
                const slotHistory = dataArr.map((data, idx) => {
                    return {
                        slot: ingest.slot,
                        executions: idx + 1,
                        solverIndex: ingest.solverIndex,
                        ingestType: ingest.ingestType,
                        data: data,
                    }
                })
                return slotHistory
            })
        )
        conditions.forEach((condition) => {
            const data: RichSlotsHashMapType = {}
            currentSlotData.forEach((slot) => {
                const currentSlot = slot.find(
                    (el) => el.executions === condition.executions
                )

                if (currentSlot) {
                    // Enrich slot with Metadata
                    const ulid = ethers.utils.parseBytes32String(
                        currentSlot.slot
                    )

                    // Fallback empty Slot
                    data[currentSlot.slot] = {
                        slot: currentSlot,
                        tag: slotTags[ulid] || {
                            id: ulid,
                            label: '',
                            isFlex: false,
                            description: '',
                        },
                    }
                }
            })
            slotsHistory[condition.conditionId] = data
        })
        return slotsHistory
    }

    const getIngestWithMetaData = (
        slotId: string,
        ingests: SlotModel[],
        slotTags: SlotTagsHashMapType
    ): RichSlotModel => {
        const ingestSlot = ingests.find((ingest) => ingest.slot === slotId)
        if (ingestSlot) {
            // Enrich with MetaData
            const ulid = ethers.utils.parseBytes32String(ingestSlot.slot)
            // Fallback empty Slot
            return {
                slot: ingestSlot,
                tag: slotTags[ulid] || {
                    id: ulid,
                    label: '',
                    isFlex: false,
                    description: '',
                },
            }
        } else {
            throw new Error(`Error while finding ingest with slotId: ${slotId}`)
        }
    }

    const getRecipientSlots = (
        condition: SolverContractCondition
    ): RichSlotModel[] => {
        if (currentSolverData) {
            return currentSolverData.config.conditionBase.allocations.map(
                (allocation) =>
                    currentSolverData.slotsHistory[condition.conditionId][
                        allocation.recipientAddressSlot
                    ] ||
                    getIngestWithMetaData(
                        allocation.recipientAddressSlot,
                        currentSolverData.config.ingests,
                        currentSolverData.slotTags
                    )
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualInputs = (
        condition: SolverContractCondition
    ): RichSlotModel[] => {
        if (currentSolverData) {
            return Object.values(
                currentSolverData.slotsHistory[condition.conditionId]
            ).filter((slot) => slot.slot.ingestType === SlotType.Manual)
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualSlots = (): RichSlotModel[] => {
        if (currentSolverData) {
            return currentSolverData.config.ingests.reduce(
                (filtered: RichSlotModel[], ingest) => {
                    if (ingest.ingestType === SlotType.Manual) {
                        filtered.push(
                            getIngestWithMetaData(
                                ingest.slot,
                                currentSolverData.config.ingests,
                                currentSolverData.slotTags
                            )
                        )
                    }
                    return filtered
                },
                []
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getNumMintedTokensForConditions = async (
        conditions: SolverContractCondition[],
        collateralToken: string
    ) => {
        if (ctf) {
            const numMintedByCondition = {} as {
                [conditionId: string]: BigNumber
            }
            await Promise.all(
                conditions.map(async (condition) => {
                    const logs = await ctf.queryFilter(
                        ctf.filters.PositionSplit(
                            null,
                            null,
                            condition.parentCollectionId,
                            condition.conditionId,
                            null,
                            null
                        )
                    )

                    const amount = logs
                        .filter(
                            (l) => l.args?.collateralToken === collateralToken
                        )
                        .map((l) => l.args?.amount)
                        .filter(Boolean)
                        .reduce((x, y) => {
                            return BigNumber.from(x).add(BigNumber.from(y))
                        }, BigNumber.from(0))

                    numMintedByCondition[condition.conditionId] = amount
                })
            )

            return numMintedByCondition
        }
    }

    const basicSolverMethods: BasicSolverMethodsType = {
        prepareSolve: prepareSolve,
        executeSolve: executeSolve,
        proposePayouts: proposePayouts,
        confirmPayouts: confirmPayouts,
        addData: addData,
        getCollateralBalance: getCollateralBalance,
        getChainParent: getChainParent,
        getChainChild: getChainChild,
        getSolverChain: getSolverChain,
        getChainIndex: getChainIndex,
        getTimelock: getTimelock,
        getTrackingID: getTrackingID,
        getUIUri: getUIUri,
        getData: getData,
        getCurrentSlots: getCurrentSlots,
        getCondition: getCondition,
        getConditions: getConditions,
        getConfig: getConfig,
        getManualInputs: getManualInputs,
        getManualSlots: getManualSlots,
        getRecipientSlots: getRecipientSlots,
    }

    // TODO Determine SolverUI
    const loadWriter = true
    if (isDeployed === false) {
        return (
            <BaseLayout contextTitle="Not found">
                <Box fill justify="center">
                    <HeaderTextSection
                        title="Solver Not Found"
                        subTitle="Looks pretty empty here"
                        paragraph="Smart contract unreachable. Perhaps the Solver has not finished deploying yet. Try refreshing in a minute."
                    />
                </Box>
            </BaseLayout>
        )
    } else if (currentSolverData && currentUser) {
        if (currentCondition === undefined) {
            return (
                <BaseLayout
                    contextTitle="Uninitialzed Solve"
                    actionBar={
                        <ExecuteSolverActionbar
                            manualSlots={getManualSlots()}
                            solverData={currentSolverData}
                            solverMethods={basicSolverMethods}
                        />
                    }
                >
                    <Box fill justify="center">
                        <HeaderTextSection
                            title={metadata.proposal?.title || ''} // NO proposal dependency in Solver.tsx
                            subTitle="Uninitialized Solver"
                            paragraph="This Solver was deployed manually. Click Prepare Solve to initialize the contract."
                        />
                    </Box>
                </BaseLayout>
            )
        }
        if (loadWriter) {
            return (
                <>
                    <WriterSolverUI
                        proposal={metadata.proposal} // NO proposal dependency in Solver.tsx
                        solverData={currentSolverData}
                        solverContract={contract}
                        currentUser={currentUser}
                        solverMethods={basicSolverMethods}
                        currentCondition={currentCondition}
                        setCurrentCondition={setCurrentCondition}
                    />
                    {isLoading && (
                        <LoadingScreen context="Please confirm this transaction" />
                    )}
                </>
            )
        } else {
            return (
                <DefaultSolverUI
                    solverData={currentSolverData}
                    solverContract={contract}
                    currentUser={currentUser}
                    currentCondition={currentCondition}
                    solverMethods={basicSolverMethods}
                    setCurrentCondition={setCurrentCondition}
                />
            )
        }
    } else {
        return <LoadingScreen context="Loading Solver" />
    }
}

export default Solver
