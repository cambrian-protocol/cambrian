import { AppProps } from 'next/app'
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
        <Store>
            <Grommet full theme={cpTheme}>
                <GlobalStyle />
                <Component {...pageProps} />
            </Grommet>
        </Store>
    )
}
