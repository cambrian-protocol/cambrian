import { AppProps } from 'next/app'
import { CERAMIC_NODE_ENDPOINT } from '../config'
import ErrorBoundary from '@cambrian/app/components/errors/ErrorBoundary'
import { GlobalStyle } from '@cambrian/app/src/theme/globalStyle'
import { Grommet } from 'grommet'
import { Provider } from '@self.id/framework'
import { Store } from '@cambrian/app/src/store/Store'
import { cpTheme } from '@cambrian/app/src/theme/theme'
import { useThemeContext } from '@cambrian/app/hooks/useThemeContext'

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

export default function App({ ...props }: AppProps) {
    return (
        <Provider
            client={{
                ceramic: CERAMIC_NODE_ENDPOINT,
                connectNetwork: 'testnet-clay',
            }}
            session
        >
            <Core {...props} />
        </Provider>
    )
}

const Core = ({ Component, pageProps }: AppProps) => {
    const { themeMode } = useThemeContext()
    return (
        <Grommet
            full
            theme={cpTheme}
            themeMode={themeMode}
            background={'background-back'}
        >
            <GlobalStyle />
            <Store>
                <ErrorBoundary>
                    <Component {...pageProps} />
                </ErrorBoundary>
            </Store>
        </Grommet>
    )
}
