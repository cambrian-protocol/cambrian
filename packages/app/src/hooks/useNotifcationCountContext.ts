import {
    NotificationCountContext,
    NotificationCountContextType,
} from '../store/NotificationCountContext'

import { useContext } from 'react'

export const useNotificationCountContext = () => {
    return useContext<NotificationCountContextType>(NotificationCountContext)
}
