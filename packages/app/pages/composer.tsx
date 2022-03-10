import { Composer } from '@cambrian/app/src/ui/composer/Composer'
import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'

export default function ComposerPage() {
    return (
        <ComposerContextProvider>
            <Composer />
        </ComposerContextProvider>
    )
}
