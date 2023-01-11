import { Box } from 'grommet'
import { Image } from 'grommet'
import { useRouter } from 'next/router'

interface CambrianLogoMarkProps {
    size?: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large'
    isSafeApp?: boolean
}

const CambrianLogoMark = ({ size, isSafeApp }: CambrianLogoMarkProps) => {
    const router = useRouter()
    return (
        <Box
            onClick={
                isSafeApp ? () => router.push('/safe') : () => router.push('/')
            }
            focusIndicator={false}
            width={{
                min: size ? size : 'xxsmall',
                max: size ? size : 'xxsmall',
            }}
        >
            <Image src="/images/logo/cambrian_protocol_logo.svg" />
        </Box>
    )
}

export default CambrianLogoMark
