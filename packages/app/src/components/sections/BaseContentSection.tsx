import { Box } from 'grommet'
import HeaderTextSection from './HeaderTextSection'
import { ResponsiveContext } from 'grommet'

interface BaseContentSectionProps {
    title: string
    paragraph: string
    subTitle: string
    image: JSX.Element
    anchor: JSX.Element
    align?: 'right' | 'left'
}

const BaseContentSection = ({
    title,
    paragraph,
    image,
    subTitle,
    anchor,
    align,
}: BaseContentSectionProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box
                    justify="center"
                    align="center"
                    pad={{ vertical: 'large' }}
                >
                    <Box
                        direction={align === 'right' ? 'row-reverse' : 'row'}
                        wrap
                        justify="center"
                        height={{ min: '50vh' }}
                    >
                        <Box
                            justify="center"
                            width={'large'}
                            gap="large"
                            pad="large"
                        >
                            <HeaderTextSection
                                title={title}
                                paragraph={paragraph}
                                subTitle={subTitle}
                            />
                            {anchor}
                        </Box>
                        <Box
                            pad="large"
                            width="large"
                            justify={
                                screenSize === 'small' ? 'start' : 'center'
                            }
                        >
                            {image}
                        </Box>
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default BaseContentSection
