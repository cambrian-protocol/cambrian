import { Box } from 'grommet'
import FooterBrandingSection from './FooterBrandingSection'
import FooterCTASection from './FooterCTASection'
import FooterCopyrightSection from './FooterCopyrightSection'
import FooterDisclamerSection from './FooterDisclamerSection'
import FooterLinksSection from './FooterLinksSection'
import FooterPrivacyPolicySection from './FooterPrivacyPolicySection'
import FooterTermsSection from './FooterTermsSection'
import ThemeToogleButton from '../../buttons/ThemeToogleButton'

const MobileFooter = () => (
    <Box
        pad={{
            horizontal: 'large',
            top: 'medium',
        }}
    >
        <Box border={{ side: 'top' }}>
            <FooterBrandingSection />
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
                <ThemeToogleButton size="small" />
                <FooterPrivacyPolicySection />
                <FooterTermsSection />
                <FooterCopyrightSection />
            </Box>
        </Box>
    </Box>
)

export default MobileFooter
