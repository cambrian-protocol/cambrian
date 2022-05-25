import { Text } from 'grommet'

const FooterCopyrightSection = () => (
    <Text size="small" color="dark-4" textAlign="center">
        Copyright © {new Date().getFullYear()} Cambrian Protocol. All rights
        reserved
    </Text>
)

export default FooterCopyrightSection
