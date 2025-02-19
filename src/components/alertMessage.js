import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const alert = {
  successMessage,
  errorMessage,
}

function errorMessage(message) {
  toast.error(message, {
    position: toast.POSITION.TOP_CENTER,
    hideProgressBar: true,
    autoClose: 5000,
  })
}
function successMessage(message) {
  toast.success(message, {
    position: toast.POSITION.TOP_CENTER,
    hideProgressBar: true,
    autoClose: 5000,
  })
}
