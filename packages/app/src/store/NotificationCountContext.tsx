import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'

export type NotificationCountContextType = {
    notificationCounter: number
    setNotificationCounter: (counter: number) => void
}

export const NotificationCountContext =
    React.createContext<NotificationCountContextType>({
        notificationCounter: 0,
        setNotificationCounter: () => {},
    })

export const NotificationCountProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const [notificationCounter, _setNotificationCounter] = useState(0)
    const notificationCounterRef = useRef(notificationCounter)

    useEffect(() => {
        notificationCounterRef.current = notificationCounter
    })
    const setNotificationCounter = (counter: number) => {
        notificationCounterRef.current = counter
        _setNotificationCounter(counter)
    }

    return (
        <NotificationCountContext.Provider
            value={{
                notificationCounter: notificationCounterRef.current,
                setNotificationCounter: setNotificationCounter,
            }}
        >
            {children}
        </NotificationCountContext.Provider>
    )
}
