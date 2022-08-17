import { Box } from 'grommet'
import FooterBrandingSection from './FooterBrandingSection'
import FooterCTASection from './FooterCTASection'
import FooterCopyrightSection from './FooterCopyrightSection'
import FooterCreditSection from './FooterCreditSection'
import FooterDisclamerSection from './FooterDisclamerSection'
import FooterLinksSection from './FooterLinksSection'
import FooterPartnersSection from './FooterPartnersSection'
import FooterPrivacyPolicySection from './FooterPrivacyPolicySection'
import FooterTermsSection from './FooterTermsSection'

const DesktopFooter = () => {
    return (
        <Box
            pad={{
                horizontal: 'large',
                top: 'medium',
            }}
        >
            <Box border={{ side: 'top' }} direction="row">
                <Box basis="1/2" border={{ side: 'right' }}>
                    <FooterBrandingSection />
                    <FooterLinksSection />
                </Box>
                <Box basis="1/2">
                    <FooterPartnersSection />
                    <FooterCTASection />
                </Box>
            </Box>
            <Box
                border={{ side: 'top' }}
                gap="medium"
                pad={{
                    top: 'medium',
                    bottom: 'xlarge',
                }}
            >
                <FooterDisclamerSection />
                <Box direction="row" align="center" gap="medium">
                    <FooterCopyrightSection />
                    <FooterTermsSection />
                    <FooterPrivacyPolicySection />
                    <FooterCreditSection />
                    <Box flex />
                    {/* <ThemeToogleButton size="small" showLabel /> */}
                </Box>
            </Box>
        </Box>
    )
}

export default DesktopFooter
