import { Anchor, Text } from 'grommet'

const FooterCreditSection = () => {
    return (
        <Text size="small" color="dark-4">
            Illustrations by{' '}
            <Anchor href="https://woobro.design/">
                <Text size="small" color="dark-4">
                    Woobro Design
                </Text>
            </Anchor>
        </Text>
    )
}

export default FooterCreditSection
