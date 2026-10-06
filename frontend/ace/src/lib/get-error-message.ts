import axios from 'axios'

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      (error.code === 'ERR_NETWORK' ? 'Cannot reach the server' : error.message)
    )
  }
  return 'Something went wrong'
}
