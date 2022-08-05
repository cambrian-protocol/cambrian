import { PermissionContext } from '../store/PermissionContext'
import { PermissionType } from '../store/UserContext'
import { useContext } from 'react'

const usePermissionContext = (permission: PermissionType) => {
    const { isAllowedTo } = useContext(PermissionContext)
    return isAllowedTo(permission)
}

export default usePermissionContext
