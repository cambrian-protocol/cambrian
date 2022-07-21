import { Box } from 'grommet'
import FooterBrandingSection from './FooterBrandingSection'
import FooterCTASection from './FooterCTASection'
import FooterCopyrightSection from './FooterCopyrightSection'
import FooterDisclamerSection from './FooterDisclamerSection'
import FooterLinksSection from './FooterLinksSection'
import FooterPartnersSection from './FooterPartnersSection'
import FooterPrivacyPolicySection from './FooterPrivacyPolicySection'
import FooterTermsSection from './FooterTermsSection'

const MobileFooter = () => (
    <Box
        pad={{
            horizontal: 'large',
            top: 'medium',
        }}
    >
        <Box border={{ side: 'top' }}>
            <FooterBrandingSection />
            <FooterPartnersSection />
            <FooterCTASection />
            <FooterLinksSection />
        </Box>
        <Box
            border={{ side: 'top' }}
            gap="medium"
            pad={{
                top: 'large',
                bottom: 'xlarge',
            }}
        >
            <FooterDisclamerSection />
            <Box align="center" gap="medium">
                {/*  <ThemeToogleButton size="small" /> */}
                <FooterTermsSection />
                <FooterPrivacyPolicySection />
                <FooterCopyrightSection />
            </Box>
        </Box>
    </Box>
)

export default MobileFooter
