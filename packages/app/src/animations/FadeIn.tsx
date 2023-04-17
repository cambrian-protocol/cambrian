import { PropsWithChildren, useState } from 'react'

import { Box } from 'grommet'
import { InView } from 'react-intersection-observer'

interface IFadeIn extends PropsWithChildren<{}> {
    direction?: 'X' | 'Y'
    distance?: string
    speed?: string
    delay?: string
}

const FadeIn = ({
    children,
    direction = 'Y',
    distance = '100%',
    speed = '1s',
    delay = '0s',
}: IFadeIn) => {
    const [isVisible, setIsVisible] = useState(false)

    const handleVisibilityChange = (inView: boolean) => {
        setIsVisible(inView)
    }

    const fadeInAnimation = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible
            ? 'translate(0)'
            : `translate${direction}(${distance})`,
        transition: `opacity ${speed}, transform ${speed}`,
        transitionDelay: isVisible ? delay : '0s',
    }

    return (
        <InView onChange={handleVisibilityChange}>
            <Box style={fadeInAnimation}>{children}</Box>
        </InView>
    )
}
export default FadeIn
