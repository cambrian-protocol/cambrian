import { Box, Image } from 'grommet'

import Link from 'next/link'
import React from 'react'

interface ILogoButton {
    href: string
    logoSrc: string
}

const LogoButton = ({ href, logoSrc }: ILogoButton) => {
    return (
        <Link href={href} legacyBehavior passHref>
            <a target={'_blank'} rel="noopener noreferrer">
                <Box
                    border
                    pad="small"
                    round="xsmall"
                    elevation="large"
                    background="bg-front-transparent"
                    style={{ backdropFilter: 'blur(5px) ' }}
                    justify="center"
                    align="center"
                    gap="small"
                    hoverIndicator={{
                        background: 'background-contrast-hover',
                    }}
                    onClick={() => {}}
                >
                    <Box
                        width={{
                            min: 'xsmall',
                            max: 'xsmall',
                        }}
                        height={{
                            min: 'xsmall',
                            max: 'xsmall',
                        }}
                    >
                        <Image src={logoSrc} fit="contain" fill />
                    </Box>
                </Box>
            </a>
        </Link>
    )
}

export default LogoButton
