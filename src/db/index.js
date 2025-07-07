// 使用uTools的dbStorage API
export const db = {
  get: key => {
    return window.utools.dbStorage.getItem(key)
  },
  set: (key, value) => {
    window.utools.dbStorage.setItem(key, value)
  },
  remove: key => {
    window.utools.dbStorage.removeItem(key)
  },
  clear: () => {
    window.utools.dbStorage.clear()
  }
}
