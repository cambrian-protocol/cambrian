import React, {
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from 'react'

import { ethers } from 'ethers'
import { UserContext } from './UserContext'
const CTF_ABI =
    require('@artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json').abi

export type UserType = {
    address: string
    signer: ethers.providers.JsonRpcSigner
}

export type CTFContextType = ethers.Contract | null

export const CTFContext = React.createContext<CTFContextType>(null)

export const CTFContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const user = useContext(UserContext)
    const [ctf, setCtf] = useState<CTFContextType>(null)

    useEffect(() => {
        if (user?.currentUser?.signer && process.env.NEXT_PUBLIC_CTF_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CTF_ADDRESS,
                new ethers.utils.Interface(CTF_ABI),
                user.currentUser.signer
            )
            setCtf(contract)
        }
    }, [user])

    return <CTFContext.Provider value={ctf}>{children}</CTFContext.Provider>
}
