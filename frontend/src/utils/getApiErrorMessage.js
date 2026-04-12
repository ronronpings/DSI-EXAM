export default function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const response = error?.response?.data

  if (typeof response?.message === 'string' && response.message.trim()) {
    return response.message
  }

  const firstError = response?.errors
    ? Object.values(response.errors).flat().find(Boolean)
    : null

  return firstError || fallback
}
