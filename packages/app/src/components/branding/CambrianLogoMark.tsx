import { Box } from 'grommet'
import { Image } from 'grommet'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

interface CambrianLogoMarkProps {
    size?: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large'
}

const CambrianLogoMark = ({ size }: CambrianLogoMarkProps) => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    return (
        <Box
            onClick={
                currentUser?.isSafeApp
                    ? () => router.push('/safe')
                    : () => router.push('/')
            }
            focusIndicator={false}
            width={{
                min: size ? size : 'xxsmall',
                max: size ? size : 'xxsmall',
            }}
        >
            <Image
                fit="contain"
                src="/images/logo/cambrian_protocol_logo.svg"
            />
        </Box>
    )
}

export default CambrianLogoMark
