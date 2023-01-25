import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ConnectWalletPage from '@cambrian/app/components/sections/ConnectWalletPage'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SUPPORTED_CHAINS } from '../config/SupportedChains'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const FreelancerOnboarding = () => {
    const { currentUser, connectWallet } = useCurrentUserContext()
    const router = useRouter()

    useEffect(() => {
        forward()
    }, [currentUser])

    const forward = async () => {
        if (currentUser) {
            if (!currentUser.did || !currentUser.cambrianProfileDoc)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']
            const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
            const streamID = await ceramicTemplateAPI.createTemplate(
                randimals(),
                SUPPORTED_CHAINS[currentUser?.chainId].compositions[
                    'Basic Freelance/Bounty'
                ]
            )

            if (!streamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                router.push(`/profile/new/${streamID}?target=template`)
            } else {
                router.push(`/template/new/${streamID}`)
            }
        }
    }

    return (
        <>
            {currentUser?.session ? (
                <LoadingScreen context={'Initializing Freelancing Service'} />
            ) : (
                <ConnectWalletPage connectWallet={connectWallet} />
            )}
        </>
    )
}

export default FreelancerOnboarding
