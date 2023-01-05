export default {
    moduleNameMapper: {
        '@cambrian/app/src/(.*)': '<rootDir>/src/$1',
        '@cambrian/app/models/(.*)': '<rootDir>/src/models/$1',
        '@cambrian/app/ui/(.*)': '<rootDir>/src/ui/$1',
        '@cambrian/app/components/(.*)': '<rootDir>/src/components/$1',
        '@cambrian/app/store/(.*)': '<rootDir>/src/store/$1',
        '@cambrian/app/services/(.*)': '<rootDir>/src/services/$1',
        '@cambrian/app/utils/(.*)': '<rootDir>/src/utils/$1',
        '@cambrian/app/classes/(.*)': '<rootDir>/src/classes/$1',
        '@cambrian/app/constants/(.*)': '<rootDir>/src/constants/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
}
