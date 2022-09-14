import { Box } from 'grommet'
import { Image } from 'grommet'
import { useRouter } from 'next/router'

interface CambrianLogoMarkProps {
    size?: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large'
}

const CambrianLogoMark = ({ size }: CambrianLogoMarkProps) => {
    const router = useRouter()
    return (
        <Box
            onClick={() => router.push('/dashboard')}
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
