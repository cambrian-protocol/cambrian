import React, { useEffect, useState } from 'react'

import { Permission } from './UserContext'

type PermissionContextType = {
    isAllowedTo: (permission: Permission) => boolean
}
type PermissionProvicerProps = {
    permissions?: Permission[]
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
    const isAllowedTo = (permission: Permission): boolean => {
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
