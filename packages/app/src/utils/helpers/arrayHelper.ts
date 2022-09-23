export const pushUnique = (item: string, items?: string[]) => {
    let updatedItems: string[] = []
    if (items) {
        updatedItems = [...items]
        const idx = updatedItems.findIndex((s) => s === item)
        if (idx !== -1) {
            updatedItems.splice(idx, 1)
        }
    }
    updatedItems.push(item)
    return updatedItems
}
