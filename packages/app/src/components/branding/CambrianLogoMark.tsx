import { Box } from 'grommet'
import { Image } from 'grommet'
import { useRouter } from 'next/router'

const CambrianLogoMark = () => {
    const router = useRouter()
    return (
        <Box
            onClick={() => router.push('/')}
            focusIndicator={false}
            width={{
                min: 'xxsmall',
                max: 'xxsmall',
            }}
        >
            <Image src="/images/logo/cambrian_protocol_logo.svg" />
        </Box>
    )
}

export default CambrianLogoMark
