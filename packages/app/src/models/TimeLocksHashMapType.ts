export type TimeLocksHashMapType = {
    [conditionId: string]: number
}

export type TimelockModel = {
    timelockSeconds: number
    isTimelockActive: boolean
}
