import { PermissionType } from './UserContext'
import React from 'react'

type PermissionContextType = {
    isAllowedTo: (permission: PermissionType) => boolean
}
type PermissionProvicerProps = {
    permissions: PermissionType[]
}

const defaultBehaviour: PermissionContextType = {
    isAllowedTo: () => false,
}

export const PermissionContext =
    React.createContext<PermissionContextType>(defaultBehaviour)

const PermissionProvider: React.FunctionComponent<PermissionProvicerProps> = ({
    permissions,
    children,
}) => {
    const isAllowedTo = (permission: PermissionType): boolean => {
        if (!permissions) return false
        return permissions.includes(permission)
    }

    return (
        <PermissionContext.Provider value={{ isAllowedTo }}>
            {children}
        </PermissionContext.Provider>
    )
}

export default PermissionProvider
