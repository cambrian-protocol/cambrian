import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'

export default function ComposerPage() {
    return (
        <ComposerContextProvider>
            <ComposerUI />
        </ComposerContextProvider>
    )
}
