import { PropsWithChildren } from 'react'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import WrongChainSection from '../sections/WrongChainSection'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

const WrongChainBoundary = ({ children }: PropsWithChildren<{}>) => {
    const { currentUser } = useCurrentUserContext()
    return (
        <>
            {currentUser && !SUPPORTED_CHAINS[currentUser.chainId] ? (
                <WrongChainSection />
            ) : (
                <>{children}</>
            )}
        </>
    )
}

export default WrongChainBoundary
