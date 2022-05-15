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
            <Image src="/images/cambrian_protocol_logo_400x400.png" />
        </Box>
    )
}

export default CambrianLogoMark
