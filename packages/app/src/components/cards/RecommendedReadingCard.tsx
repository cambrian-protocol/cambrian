import { Anchor } from 'grommet'
import { Box } from 'grommet'
import { Card } from 'grommet'
import { Image } from 'grommet'
import { Text } from 'grommet'

interface RecommendedReadingCardProps {
    imageUrl: string
    title: string
    author: string
    href: string
}

const RecommendedReadingCard = ({
    imageUrl,
    title,
    author,
    href,
}: RecommendedReadingCardProps) => (
    <Anchor href={href}>
        <Box pad="small">
            <Card
                height={'medium'}
                background="background-contrast"
                width={{ min: '23em', max: '23em' }}
            >
                <Image src={imageUrl} fit="cover" />
                <Box height={{ min: '30%' }} pad="medium">
                    <Text weight={'normal'} color="dark-4" size="small">
                        {author}
                    </Text>
                    <Text>{title}</Text>
                </Box>
            </Card>
        </Box>
    </Anchor>
)

export default RecommendedReadingCard
