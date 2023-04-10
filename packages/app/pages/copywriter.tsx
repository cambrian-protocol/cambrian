import ConnectWalletPage from '@cambrian/app/components/sections/ConnectWalletPage'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SUPPORTED_CHAINS } from '../config/SupportedChains'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const CopyWriterOnboarding = () => {
    const { currentUser, connectWallet } = useCurrentUserContext()
    const router = useRouter()

    useEffect(() => {
        forward()
    }, [currentUser])

    const forward = async () => {
        try {
            if (currentUser) {
                if (!currentUser.did || !currentUser.cambrianProfileDoc)
                    throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

                if (
                    !SUPPORTED_CHAINS[currentUser.chainId].compositions[
                        'Copywriter'
                    ]
                )
                    throw new Error('Undefined default Composition')

                const templateService = new TemplateService()
                const res = await templateService.create(
                    currentUser,
                    SUPPORTED_CHAINS[currentUser?.chainId].compositions[
                        'Copywriter'
                    ],
                    randimals()
                )

                if (!res) throw new Error('Failed to create Template')

                if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                    router.push(`/profile/new/${res.streamID}?target=template`)
                } else {
                    router.push(`/template/new/${res.streamID}`)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {currentUser?.session ? (
                <LoadingScreen context={'Initializing Copywriter Service'} />
            ) : (
                <ConnectWalletPage connectWallet={connectWallet} />
            )}
        </>
    )
}

export default CopyWriterOnboarding
