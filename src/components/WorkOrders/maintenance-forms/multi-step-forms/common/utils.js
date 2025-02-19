export const validateReceivedPhoto = (e, callback) => {
  const reader = new FileReader()
  const file = e.target.files[0]
  reader.onload = d => {
    const extension = file.name.split('.').slice(-1).pop()
    callback({ error: !['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension), msg: 'Invalid Image format !', file })
  }
  reader.onloadend = () => {}
  reader.readAsDataURL(file)
  e.target.value = null
}
