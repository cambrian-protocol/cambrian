import { Box } from 'grommet'
import { Text } from 'grommet'

const FooterDisclamerSection = () => (
    <>
        <Text size="small" weight={'bold'}>
            Financial and Legal Disclamer
        </Text>
        <Text size="xsmall" color="dark-4">
            The information provided on cambrianprotocol.com is for
            informational purposes only. It should not be considered legal or
            financial advice. You should consult with a financial advisor,
            attorney or other professional to determine what may be best for
            your individual needs.
        </Text>
        <Text size="xsmall" color="dark-4">
            cambrianprotocol.com does not make any guarantee or other promise as
            to any results that may be obtained from using our content. No one
            should make any investment decision without first consulting his or
            her own financial advisor and conducting his or her own research and
            due diligence. To the maximum extent permitted by law,
            cambrianprotocol.com disclaims any and all liability in the event
            any information, commentary, analysis, opinions, advice and/or
            recommendations prove to be inaccurate, incomplete or unreliable, or
            result in any investment or other losses.
        </Text>
        <Box gap="small" pad={{ bottom: 'large' }} border={{ side: 'bottom' }}>
            <Text size="xsmall" color="dark-4">
                Content contained on or made available through the website is
                not intended to and does not constitute legal advice or
                investment advice and no attorney-client relationship is formed.
                Your use of the information on the website or materials linked
                from the Web is at your own risk.
            </Text>
            <Text size="xsmall" color="dark-4" weight={'bold'}>
                Investing in or engaging with blockchain technology, dApps,
                cryptocurrencies, or tokens is highly speculative, and the
                market is largely unregulated. Anyone considering it should be
                prepared to lose their entire investment.
            </Text>
        </Box>
    </>
)

export default FooterDisclamerSection
