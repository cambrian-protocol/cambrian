import React, {
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from 'react'

import { UserContext } from './UserContext'
import { BigNumberish, ethers } from 'ethers'

const FACTORY_ABI =
    require('@artifacts/contracts/SolverFactory.sol/SolverFactory.json').abi

export type FactoryContextType = ethers.Contract | null
export const FactoryContext = React.createContext<FactoryContextType>(null)

export type SolverDeployments = {
    [address: string]: BigNumberish
}

export const FactoryContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const user = useContext(UserContext)
    const [factory, setFactory] = useState<FactoryContextType>(null)

    useEffect(() => {
        if (
            user?.currentUser?.signer &&
            process.env.NEXT_PUBLIC_FACTORY_ADDRESS
        ) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
                new ethers.utils.Interface(FACTORY_ABI),
                user.currentUser.signer
            )
            setFactory(contract)
        }
    }, [user])

    return (
        <FactoryContext.Provider value={factory}>
            {children}
        </FactoryContext.Provider>
    )
}
