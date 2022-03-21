import { AppProps } from 'next/app'
import ErrorBoundary from '@cambrian/app/components/errors/ErrorBoundary'
import { GlobalStyle } from '@cambrian/app/src/theme/globalStyle'
import { Grommet } from 'grommet'
import { Store } from '@cambrian/app/src/store/Store'
import { cpTheme } from '@cambrian/app/src/theme/theme'

declare global {
    interface Window {
        ethereum: any
    }
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ErrorBoundary>
            <Store>
                <Grommet full theme={cpTheme} themeMode="dark">
                    <GlobalStyle />
                    <Component {...pageProps} />
                </Grommet>
            </Store>
        </ErrorBoundary>
    )
}
