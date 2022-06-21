import { AppProps } from 'next/app'
import ErrorBoundary from '@cambrian/app/components/errors/ErrorBoundary'
import { GlobalStyle } from '@cambrian/app/src/theme/globalStyle'
import { Grommet } from 'grommet'
import { Provider } from '@self.id/framework'
import { Store } from '@cambrian/app/src/store/Store'
import { cpTheme } from '@cambrian/app/src/theme/theme'
import { useTheme } from '@cambrian/app/hooks/useTheme'

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
        <Provider client={{ ceramic: 'testnet-clay' }}>
            <Store>
                <Core {...props} />
            </Store>
        </Provider>
    )
}

const Core = ({ Component, pageProps }: AppProps) => {
    const { themeMode } = useTheme()
    return (
        <Grommet
            full
            theme={cpTheme}
            themeMode={themeMode}
            background={'background-back'}
        >
            <GlobalStyle />
            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </Grommet>
    )
}
