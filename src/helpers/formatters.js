import { camelCase, snakeCase } from 'lodash'

export const camelizeKeys = obj => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v))
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}

export const snakifyKeys = (obj = {}) => {
  if (Array.isArray(obj)) {
    return obj.map(v => snakifyKeys(v))
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeCase(key)]: snakifyKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}
