export const SHOW_BETA_WARNING =
    process.env.NODE_ENV === 'development' ? false : true
export const INFURA_ID = '811d34e940cf46b18bb8788535af23a2'
export const FALLBACK_RPC_URL =
    'https://ropsten.infura.io/v3/5e5e73b367364266b008aed15e5b3189' // TODO Change to main, once we're on main

// IPFS
export const IPFS_PIN_ENDPOINT =
    process.env.NODE_ENV === 'production'
        ? 'https://app.cambrianprotocol.com/api/pinPinata'
        : 'https://kdjzxk3x7a.execute-api.us-east-1.amazonaws.com/pinPinata'
export const IPFS_GATEWAYS = [
    'cambrianprotocol.mypinata.cloud',
    'ipfs.dweb.link',
    'ipfs.infura-ipfs.io',
]

// Ceramic
export const CERAMIC_NODE_ENDPOINT = 'https://ceramic.cambrianprotocol.com'
export const CAMBRIAN_DID =
    'did:key:z6MkqxJBUMkyryRaeYi6o2MKVNxr4kf1kzaK4ab7GsK8ByAz'

// BE Endpoints
export const WEBHOOK_API_ENDPOINT =
    'https://app.cambrianprotocol.com/api/addWebhook'
export const ERROR_LOG_API_ENDPOINT =
    'https://us-central1-cambrian-app.cloudfunctions.net/errorLog'

// Trilobot
export const TRILOBOT_ENDPOINT = 'https://trilobot.cambrianprotocol.com'

// Websocket
export const TRILOBOT_WS_ENDPOINT = 'wss://trilobot.cambrianprotocol.com'
