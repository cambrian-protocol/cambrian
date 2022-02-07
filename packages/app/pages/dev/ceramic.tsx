import { useCeramic, CeramicService } from 'use-ceramic'
import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import StreamID from '@ceramicnetwork/streamid'
import CID from 'cids'
import { UserContext } from '@cambrian/app/store/UserContext'

function SignInWithCeramic() {
    const ceramic = useCeramic()
    const user = useContext(UserContext)

    const [authenticated, setAuthenticated] = useState(ceramic.isAuthenticated)
    const [progress, setProgress] = useState(false)

    useEffect(() => {
        if (user.currentProvider) {
            handleLogin()
        }

        const subscription = ceramic.isAuthenticated$.subscribe(
            (isAuthenticated) => {
                setAuthenticated(isAuthenticated)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    const handleLogin = async () => {
        setProgress(true)
        try {
            await ceramic.authenticate()
        } catch (e) {
            console.error(e)
        } finally {
            setProgress(false)
        }
    }

    const setData = async () => {
        try {
            const doc = await TileDocument.create(
                ceramic.client,
                { foo: 'bar' },
                { family: 'test' }
            )
            const res = await TileDocument.load(ceramic.client, doc.id)
            console.log(res.content)
        } catch (e) {
            console.error(e)
        }
    }

    const renderButton = () => {
        if (progress) {
            return (
                <>
                    <button disabled={true}>Connecting...</button>
                </>
            )
        } else {
            return (
                <>
                    <button onClick={user.login}>Sign In</button>
                </>
            )
        }
    }

    if (authenticated) {
        return (
            <>
                <hr />
                <p>
                    <strong>
                        Congratulations! You have just signed in with Ceramic!
                    </strong>
                </p>
                <p>
                    Your DID: <code>{ceramic.did.id}</code>
                </p>
                <p>
                    <button onClick={setData}>Set Data</button>
                </p>
            </>
        )
    } else {
        return (
            <>
                <p>Try it yourself!</p>
                {renderButton()}
            </>
        )
    }
}

export default function Home() {
    return (
        <div>
            <Head>
                <title>Ceramic Starter</title>
                <meta name="description" content="Ceramic Starter App" />
            </Head>
            <main>
                <div>
                    <img src="/logo-ceramic.svg" alt="Ceramic Logo" />
                </div>
                <p>
                    This is a <a href={'https://ceramic.network'}>Ceramic</a>{' '}
                    and <a href={'https://idx.xyz/'}>IDX</a> starter app. You
                    can freely use it as a base for your application.
                </p>
                <p>
                    The app allows a user to sign in with Ethereum wallet, and
                    displays her DID.
                </p>
                <SignInWithCeramic />
            </main>
        </div>
    )
}
