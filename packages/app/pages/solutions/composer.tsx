import { Composer } from '@cambrian/app/src/ui/composer/Composer'
import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'

export default function ComposerPage() {
    return (
        <ComposerContextProvider>
            <Layout contextTitle="Composer" config={<SolutionConfig />}>
                <Composer />
            </Layout>
        </ComposerContextProvider>
    )
}
