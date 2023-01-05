export default {
    moduleNameMapper: {
        '@cambrian/app/src/(.*)': '<rootDir>/src/$1',
        '@cambrian/app/src/models/(.*)': '<rootDir>/src/models/$1',
        '@cambrian/app/src/ui/(.*)': '<rootDir>/src/ui/$1',
        '@cambrian/app/src/components/(.*)': '<rootDir>/src/components/$1',
        '@cambrian/app/src/store/(.*)': '<rootDir>/src/store/$1',
        '@cambrian/app/utils/(.*)': '<rootDir>/src/utils/$1',
        '@cambrian/app/classes/(.*)': '<rootDir>/src/classes/$1',
        '@cambrian/app/src/theme/(.*)': '<rootDir>/src/theme/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
}
