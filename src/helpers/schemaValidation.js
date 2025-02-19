export const validateSchema = async (obj, schema) => {
  const errors = {}
  try {
    await schema.validate(obj, { abortEarly: false })
    return true
  } catch (error) {
    error.inner.forEach(err => (errors[err.path] = { error: true, msg: err.errors[0] }))
    return errors
  }
}
