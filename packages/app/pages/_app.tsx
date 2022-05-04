import { AppProps } from 'next/app'
import ErrorBoundary from '@cambrian/app/components/errors/ErrorBoundary'
import { GlobalStyle } from '@cambrian/app/src/theme/globalStyle'
import { Grommet } from 'grommet'
import { Store } from '@cambrian/app/src/store/Store'
import { cpTheme } from '@cambrian/app/src/theme/theme'

// @ts-ignore
declare global {
    // tslint:disable-next-line
    interface Window {
        web3: any
        ethereum: any
        Web3Modal: any
        [name: string]: any
    }
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Store>
            <Grommet full theme={cpTheme} themeMode="dark">
                <GlobalStyle />
                <ErrorBoundary>
                    <Component {...pageProps} />
                </ErrorBoundary>
            </Grommet>
        </Store>
    )
}
