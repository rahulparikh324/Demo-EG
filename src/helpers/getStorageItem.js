export const getApplicationStorageItem = key => {
  return sessionStorage.getItem(key) !== null ? sessionStorage.getItem(key) : localStorage.getItem(key)
}
