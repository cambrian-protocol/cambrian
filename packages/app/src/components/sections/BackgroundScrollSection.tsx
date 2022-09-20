import { Box, Heading, Image, ImageProps, Text } from 'grommet'
import { useEffect, useRef, useState } from 'react'

import Glow from '../branding/Glow'
import styled from 'styled-components'

type ObjectPositionType =
    | 'right'
    | 'left'
    | 'center'
    | 'top'
    | 'bottom'
    | undefined

export type BackgroundScrollSection = {
    id?: string
    img?: string
    alt?: string
    title?: string
    subTitle?: string
    text?: string
    icon?: JSX.Element
    objectPosition?: ObjectPositionType
}

export type BackgroundScrollProps = {
    sections: BackgroundScrollSection[]
}

export default function BackgroundScroll(props: BackgroundScrollProps) {
    const sections = props.sections
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
    const rootRef = useRef<HTMLDivElement>(null)
    const [activeSection, setActiveSection] =
        useState<BackgroundScrollSection>()

    useEffect(() => {
        if (rootRef.current) {
            const sectionTop = rootRef.current.getBoundingClientRect().top
            // Initializes the refs of every section
            sectionRefs.current = sectionRefs.current.slice(0, sections.length)

            for (let i = 0; i < sections.length; i++) {
                const elRect = sectionRefs.current[0]?.getBoundingClientRect()
                if (elRect) {
                    const elHeightMultiplier = elRect.height * (i + 1)
                    //Is item in viewport?
                    if (sectionTop > -elHeightMultiplier) {
                        setActiveSection(props.sections[i])
                        break
                    }
                    // When all items are checked and none was in viewport, initialize the last one
                    if (i + 1 === sections.length) {
                        setActiveSection(sections[sections.length - 1])
                    }
                }
            }
            document
                .getElementById('root-page')
                ?.addEventListener('scroll', handleScroll)
        }
        return () =>
            document
                .getElementById('root-page')
                ?.removeEventListener('scroll', handleScroll)
    }, [])

    const handleScroll = () => {
        if (rootRef.current) {
            const sectionRect = rootRef.current.getBoundingClientRect()
            if (sectionRect.top < 0 && sectionRect.bottom > 0) {
                sections.map((section, i) => {
                    const elRect =
                        sectionRefs.current[i]?.getBoundingClientRect()
                    if (
                        elRect &&
                        elRect.top > 0 &&
                        elRect.top < elRect.height
                    ) {
                        setActiveSection(section)
                    }
                })
            }
        }
    }

    return (
        <Box ref={rootRef} style={{ position: 'relative' }}>
            <ImageWrapper>
                <Glow
                    height="1500px"
                    width="1000px"
                    left={'-20%'}
                    top={'50%'}
                />
                {sections.map((section, i) => (
                    <StyledImage
                        key={i}
                        active={section === activeSection}
                        src={section.img}
                        alt={section.alt}
                        objectPosition={section.objectPosition}
                    />
                ))}
            </ImageWrapper>
            <Box id="start">
                {sections.map((section, i) => (
                    <StyledBox
                        ref={(el) => (sectionRefs.current[i] = el)}
                        key={i}
                    >
                        <section id={section.id}>
                            <Box
                                justify="start"
                                align="center"
                                pad={{ top: 'xlarge', horizontal: 'large' }}
                            >
                                <Box
                                    width="large"
                                    gap="medium"
                                    pad="large"
                                    align="center"
                                    border
                                    round="xsmall"
                                >
                                    <Box gap="medium">
                                        <Heading
                                            level="1"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            {section.title}
                                        </Heading>
                                        <Text textAlign="justify">
                                            {section.subTitle}
                                        </Text>
                                        <Text textAlign="justify">
                                            {section.text}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        </section>
                    </StyledBox>
                ))}
            </Box>
        </Box>
    )
}

const ImageWrapper = styled(Box)`
    position: sticky;
    top: 0;
    height: 40vh;
`

const StyledImage = styled(Image)<
    ImageProps & { active?: boolean; objectPosition: ObjectPositionType }
>`
    position: absolute;
    height: 1500px;
    width: 100vw;
    top: 0;
    left: 0;
    object-fit: cover;
    opacity: ${(props) => (props.active ? '0.3' : '0')};
    transition: opacity 2s;
    object-position: ${(props) => props.objectPosition};
`

const StyledBox = styled(Box)`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100vh;
`
