export const storeIdInLocalStorage = (
    prefix: string,
    key: string,
    title: string,
    cid: string
) => {
    try {
        const keyWithPrefix = `${prefix}${key}`
        const data = localStorage.getItem(keyWithPrefix)
        const objToStore = { title: title, cid: cid }
        let arr = []
        if (data) {
            arr = JSON.parse(data)
            const exists = arr.find((item: any) => item.cid === cid)
            if (!exists) {
                arr.unshift(objToStore)
            }
        } else {
            arr = [objToStore]
        }
        localStorage.setItem(keyWithPrefix, JSON.stringify(arr))
    } catch (e) {
        console.warn('Error while trying to save to local storage', e)
    }
}

export const loadIdsFromLocalStorage = (prefix: string, key: string) => {
    const keyWithPrefix = `${prefix}${key}`
    const data = localStorage.getItem(keyWithPrefix)
    if (data) {
        try {
            return JSON.parse(JSON.parse(data))
        } catch {
            return JSON.parse(data)
        }
    }
    return []
}
