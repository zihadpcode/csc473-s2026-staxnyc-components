import { useEffect, useState } from 'react'

export default function useResource(loader, dependencies = []) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ data: null, error: '', loading: true })
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timer = setTimeout(() => controller.abort(), 12000)
    setState({ data: null, error: '', loading: true })
    Promise.resolve()
      .then(() => loader(controller.signal))
      .then((data) => {
        if (active) setState({ data, error: '', loading: false })
      })
      .catch((error) => {
        if (active)
          setState({
            data: null,
            error: controller.signal.aborted
              ? 'The feed took too long to respond. Try again.'
              : error.message || 'The feed is unavailable. Try again.',
            loading: false,
          })
      })
      .finally(() => clearTimeout(timer))
    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [...dependencies, attempt])
  return { ...state, retry: () => setAttempt((value) => value + 1) }
}
