import React, { PropsWithChildren, useRef } from 'react'

export const TopRefContext =
    React.createContext<React.RefObject<HTMLDivElement> | null>(null)

export const TopRefContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <TopRefContext.Provider value={ref}>{children}</TopRefContext.Provider>
    )
}
