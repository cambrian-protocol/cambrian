export type ErrorMessagesType = {
    [code: string]: ErrorMessageType
}

export type ErrorMessageType = {
    title: string
    message?: string
    error?: any
    logLevel: number
}

export const GENERAL_ERROR: ErrorMessagesType = {
    CHAIN_NOT_SUPPORTED: {
        title: 'Unsupported Blockchain',
        message: 'Please connect to the a supported Blockchain.',
        logLevel: 0,
    },
    IPFS_PIN_ERROR: {
        title: 'Unable to reach IPFS',
        message: 'Please try again later...',
        logLevel: 1,
    },
    NO_WALLET_CONNECTION: {
        title: 'No connected Wallet found',
        message: 'Please connect your wallet to use this function.',
        logLevel: 1,
    },
    FAILED_PROPOSAL_DEPLOYMENT: {
        title: 'Error while deploying solution and proposal',
        message: 'Please try again later...',
        logLevel: 1,
    },
    PROPOSE_OUTCOME_ERROR: {
        title: 'Error while proposing the outcome',
        message: 'Please try again later...',
        logLevel: 1,
    },
    WRONG_TEMPLATE_SCHEMA: {
        title: 'Generated template does not satisfy template schema',
        logLevel: 1,
    },
    WRONG_COMPOSITION_SCHEMA: {
        title: 'Generated composition does not satisfy composition schema',
        logLevel: 1,
    },
    IPFS_FETCH_ERROR: {
        title: 'Error while fetching from IPFS',
        message: 'Please try again later...',
        logLevel: 1,
    },
    PARSE_SOLVER_ERROR: { title: 'Error while parsing Solvers', logLevel: 1 },
    INVALID_METADATA: { title: 'Error while loading metadata', logLevel: 1 },
    INSUFFICIENT_FUNDS: {
        title: 'Insufficient funds',
        message: 'Please make sure you have enough tokens.',
        logLevel: 0,
    },
    MISSING_COLLATERAL_TOKEN: {
        title: 'No collateral token defined',
        logLevel: 1,
    },
    CONTRACT_CALL_ERROR: {
        title: 'Error while trying to reach the smartcontract',
        message: 'Please try again later...',
        logLevel: 1,
    },
    POST_WEBHOOK_ERROR: {
        title: 'Error while saving your provided Webhook URL',
        message: 'Please try again later...',
        logLevel: 1,
    },
    POST_ERR_LOG_ERROR: {
        title: 'Error while saving Error Log',
        logLevel: 1,
    },
    NO_SOLVER_FOUND: {
        title: 'Error while fetching Solvers from SolutionsHub',
        logLevel: 1,
    },
    ARBITRATION_ERROR: {
        title: 'Error while arbitration progress',
        logLevel: 1,
    },
    CREATE_ARBITRATOR_ERROR: {
        title: 'Error while creating arbitrator',
        logLevel: 1,
    },
    ADD_DATA_ERROR: {
        title: 'Error while adding data to the solver',
        logLevel: 1,
    },
    EXECUTE_SOLVER_ERROR: {
        title: 'Error while executing the solver',
        logLevel: 1,
    },
    CONFIRM_OUTCOME_ERROR: {
        title: 'Error while confirming outcome',
        logLevel: 1,
    },
    PREPARE_SOLVE_ERROR: {
        title: 'Error while preparing solve',
        logLevel: 1,
    },
    MODULE_ERROR: {
        title: 'Error initializing module',
        logLevel: 1,
    },
    TEST_ERROR: {
        title: 'Log Test',
        logLevel: 1,
    },
    SOLUTION_FETCH_ERROR: {
        title: 'Error while fetching Solution',
        logLevel: 1,
    },
}

export const CONTRACT_ERROR: ErrorMessagesType = {
    INVALID_ARGUMENT: {
        title: 'Invalid Contract Input',
        message: 'Please check your inputs and try again.',
        logLevel: 0,
    },
}

export const METAMASK_ERROR: ErrorMessagesType = {
    '-32700': {
        title: 'Invalid JSON was received by the server',
        message: 'An error occurred on the server while parsing the JSON text.',
        logLevel: 1,
    },
    '-32600': {
        title: 'The JSON sent is not a valid Request object',
        logLevel: 1,
    },

    '-32601': {
        title: 'The method does not exist / is not available',
        logLevel: 1,
    },

    '-32602': {
        title: 'Invalid method parameter(s)',
        logLevel: 1,
    },

    '-32603': {
        title: 'Internal JSON-RPC error',
        logLevel: 1,
    },

    '-32000': {
        title: 'Invalid input',
        logLevel: 1,
    },

    '-32001': {
        title: 'Resource not found',
        logLevel: 1,
    },

    '-32002': {
        title: 'Resource unavailable',
        logLevel: 1,
    },

    '-32003': {
        title: 'Transaction rejected',
        logLevel: 1,
    },

    '-32004': {
        title: 'Method not supported',
        logLevel: 1,
    },

    '-32005': {
        title: 'Request limit exceeded',
        logLevel: 1,
    },

    '4001': {
        title: 'User rejected the request',
        message: 'Please try again and make sure to confirm the transaction.',
        logLevel: 0,
    },

    '4100': {
        title: 'The requested account and/or method has not been authorized by the user',
        logLevel: 1,
    },

    '4200': {
        title: 'The requested method is not supported by this Ethereum provider',
        logLevel: 1,
    },

    '4900': {
        title: 'The provider is disconnected from all chains',
        logLevel: 1,
    },

    '4901': {
        title: 'The provider is disconnected from the specified chain',
        logLevel: 1,
    },
}
