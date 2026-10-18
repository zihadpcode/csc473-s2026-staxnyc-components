import { handleApi } from './handlers.js'
export function apiMiddleware() {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next()
    try {
      let body = ''
      for await (const chunk of req) {
        body += chunk
        if (body.length > 12000) {
          res.statusCode = 413
          res.end('Request too large')
          return
        }
      }
      const request = new Request('http://localhost' + req.url, {
        method: req.method,
        headers: req.headers,
        ...(body ? { body } : {}),
      })
      const response = await handleApi(request)
      res.statusCode = response.status
      for (const [key, value] of response.headers) res.setHeader(key, value)
      res.end(await response.text())
    } catch {
      res.statusCode = 500
      res.end(JSON.stringify({ error: 'Local API request failed.' }))
    }
  }
}
