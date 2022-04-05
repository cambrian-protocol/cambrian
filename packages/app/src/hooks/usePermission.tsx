import { Permission } from '../store/UserContext'
import { PermissionContext } from '../store/PermissionContext'
import { useContext } from 'react'

const usePermission = (permission: Permission) => {
    const { isAllowedTo } = useContext(PermissionContext)
    return isAllowedTo(permission)
}

export default usePermission
