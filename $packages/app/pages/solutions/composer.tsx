import { Composer } from '@cambrian/app/src/ui/composer/Composer'
import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { Layout } from '@cambrian/app/src/components/layout/Layout'

export default function ComposerPage() {
    return (
        <Layout contextTitle="Composer">
            <ComposerContextProvider>
                <Composer />
            </ComposerContextProvider>
        </Layout>
    )
}
