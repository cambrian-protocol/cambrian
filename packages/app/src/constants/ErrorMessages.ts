export type ErrorMessagesType = {
    [code: string]: ErrorMessageType
}

export type ErrorMessageType = {
    message: string
    logLevel: number
    error?: any
    info?: string
    code?: string
}

export const GENERAL_ERROR: ErrorMessagesType = {
    CHAIN_NOT_SUPPORTED: {
        message: 'Unsupported Blockchain',
        info: 'Please connect to the a supported Blockchain',
        logLevel: 0,
    },
    IPFS_PIN_ERROR: {
        message: 'Error while pinning your data to IPFS',
        info: 'Please try again later...',
        logLevel: 1,
    },
    NO_WALLET_CONNECTION: {
        message: 'No connected Wallet found',
        info: 'Please connect your wallet to use this function',
        logLevel: 1,
    },
    FAILED_PROPOSAL_DEPLOYMENT: {
        message: 'Error while deploying solution and proposal',
        info: 'Please try again later...',
        logLevel: 1,
    },
    PROPOSE_OUTCOME_ERROR: {
        message: 'Error while proposing the outcome',
        info: 'Please try again later...',
        logLevel: 1,
    },
    WRONG_TEMPLATE_SCHEMA: {
        message: 'Generated template does not satisfy template schema',
        logLevel: 1,
    },
    WRONG_COMPOSITION_SCHEMA: {
        message: 'Generated composition does not satisfy composition schema',
        logLevel: 1,
    },
    IPFS_FETCH_ERROR: {
        message: 'Error while fetching from IPFS',
        info: 'Please try again later...',
        logLevel: 1,
    },
    PARSE_SOLVER_ERROR: { message: 'Error while parsing Solvers', logLevel: 1 },
    INVALID_METADATA: { message: 'Error while loading metadata', logLevel: 1 },
    INSUFFICIENT_FUNDS: { message: 'Insufficient funds', logLevel: 1 },
    MISSING_COLLATERAL_TOKEN: {
        message: 'No collateral token defined',
        logLevel: 1,
    },
    CONTRACT_CALL_ERROR: {
        message: 'Error while trying to reach the smartcontract',
        info: 'Please try again later...',
        logLevel: 1,
    },
    POST_WEBHOOK_ERROR: {
        message: 'Error while saving your provided Webhook URL',
        info: 'Please try again later...',
        logLevel: 1,
    },
    POST_ERR_LOG_ERROR: {
        message: 'Error while saving Error Log',
        logLevel: 1,
    },
    NO_SOLVER_FOUND: {
        message: 'Error while fetching Solvers from SolutionsHub',
        logLevel: 1,
    },
    ARBITRATION_ERROR: {
        message: 'Error while arbitration progress',
        logLevel: 1,
    },
    CREATE_ARBITRATOR_ERROR: {
        message: 'Error while creating arbitrator',
        logLevel: 1,
    },
    ADD_DATA_ERROR: {
        message: 'Error while adding data to the solver',
        logLevel: 1,
    },
    EXECUTE_SOLVER_ERROR: {
        message: 'Error while executing the solver',
        logLevel: 1,
    },
    CONFIRM_OUTCOME_ERROR: {
        message: 'Error while confirming outcome',
        logLevel: 1,
    },
    PREPARE_SOLVE_ERROR: {
        message: 'Error while preparing solve',
        logLevel: 1,
    },
    MODULE_ERROR: {
        message: 'Error initializing module',
        logLevel: 1,
    },
    TEST_ERROR: {
        message: 'Log Test',
        logLevel: 1,
    },
    SOLUTION_FETCH_ERROR: {
        message: 'Error while fetching Solution',
        logLevel: 1,
    },
}

export const CONTRACT_ERROR: ErrorMessagesType = {
    INVALID_ARGUMENT: {
        message: 'Invalid Contract Input',
        info: 'Please check your inputs and try again',
        logLevel: 0,
    },
}

export const METAMASK_ERROR: ErrorMessagesType = {
    '-32700': {
        message: 'Invalid JSON was received by the server',
        info: 'An error occurred on the server while parsing the JSON text',
        logLevel: 1,
    },
    '-32600': {
        message: 'The JSON sent is not a valid Request object',
        logLevel: 1,
    },

    '-32601': {
        message: 'The method does not exist / is not available',
        logLevel: 1,
    },

    '-32602': {
        message: 'Invalid method parameter(s)',
        logLevel: 1,
    },

    '-32603': {
        message: 'Internal JSON-RPC error',
        logLevel: 1,
    },

    '-32000': {
        message: 'Invalid input',
        logLevel: 1,
    },

    '-32001': {
        message: 'Resource not found',
        logLevel: 1,
    },

    '-32002': {
        message: 'Resource unavailable',
        logLevel: 1,
    },

    '-32003': {
        message: 'Transaction rejected',
        logLevel: 1,
    },

    '-32004': {
        message: 'Method not supported',
        logLevel: 1,
    },

    '-32005': {
        message: 'Request limit exceeded',
        logLevel: 1,
    },

    '4001': {
        message: 'User rejected the request',
        info: 'Please try again and make sure to confirm the transaction',
        logLevel: 0,
    },

    '4100': {
        message:
            'The requested account and/or method has not been authorized by the user',
        logLevel: 1,
    },

    '4200': {
        message:
            'The requested method is not supported by this Ethereum provider',
        logLevel: 1,
    },

    '4900': {
        message: 'The provider is disconnected from all chains',
        logLevel: 1,
    },

    '4901': {
        message: 'The provider is disconnected from the specified chain',
        logLevel: 1,
    },
}
