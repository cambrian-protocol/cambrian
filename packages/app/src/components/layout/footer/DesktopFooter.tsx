import { Box } from 'grommet'
import FooterBrandingSection from './FooterBrandingSection'
import FooterCTASection from './FooterCTASection'
import FooterCopyrightSection from './FooterCopyrightSection'
import FooterDisclamerSection from './FooterDisclamerSection'
import FooterLinksSection from './FooterLinksSection'
import FooterPrivacyPolicySection from './FooterPrivacyPolicySection'
import FooterTermsSection from './FooterTermsSection'
import ThemeToogleButton from '../../buttons/ThemeToogleButton'

interface DesktopFooterProps {}

const DesktopFooter = ({}: DesktopFooterProps) => {
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
                    <Box flex />
                    <ThemeToogleButton size="small" showLabel />
                </Box>
            </Box>
        </Box>
    )
}

export default DesktopFooter
