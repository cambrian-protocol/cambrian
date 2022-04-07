export const storeIdInLocalStorage = (
    prefix: string,
    key: string,
    title: string,
    cid: string
) => {
    const keyWithPrefix = `${prefix}-${key}`
    const data = localStorage.getItem(keyWithPrefix)
    const objToStore = { title: title, cid: cid }
    let arr = []
    if (data) {
        arr = JSON.parse(data)
        arr.unshift(objToStore)
    } else {
        arr = [objToStore]
    }
    localStorage.setItem(keyWithPrefix, JSON.stringify(arr))
}

export const loadIdsFromLocalStorage = (prefix: string, key: string) => {
    const keyWithPrefix = `${prefix}-${key}`
    const data = localStorage.getItem(keyWithPrefix)
    if (data) {
        return JSON.parse(data)
    }
    return []
}
