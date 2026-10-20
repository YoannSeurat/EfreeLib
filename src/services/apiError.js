/**
 * An API failure with a status and a message written for the person using the app.
 * `quota` is true when the provider says its request limit is used up.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, quota = false, network = false, userMessage = '' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.quota = quota
    this.network = network
    this.userMessage = userMessage || message
    // What the person can do about it, for the end of the message
    this.advice = network
      ? 'Check your connection and try again.'
      : quota || status >= 500
        ? 'Try again in a few minutes.'
        : ''
  }

  /** The message and its advice, as one sentence group. */
  get fullMessage() {
    return [this.userMessage, this.advice].filter(Boolean).join(' ')
  }
}

/** Runs a fetch and turns failures into ApiError. Returns the parsed JSON. */
export async function fetchJson(url, label) {
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new ApiError(`${label} could not be reached`, {
      network: true,
      userMessage: `${label} could not be reached.`,
    })
  }

  if (!response.ok) {
    let reason = ''
    try {
      const body = await response.json()
      reason = body?.error?.errors?.[0]?.reason || body?.error?.status || ''
    } catch {
      // Not JSON; the status is enough
    }
    const quota =
      response.status === 429 || /rateLimit|quota|dailyLimit|RESOURCE_EXHAUSTED/i.test(reason)
    throw new ApiError(`${label} answered ${response.status}`, {
      status: response.status,
      quota,
      userMessage: quota
        ? `${label} has reached its request limit for now.`
        : `${label} answered with error ${response.status}.`,
    })
  }

  return response.json()
}

/** Runs `task`, and once more after a short wait if it failed in a way that may pass. */
export async function withRetry(task, wait = 500) {
  try {
    return await task()
  } catch (error) {
    const passing =
      error instanceof ApiError && !error.quota && (error.network || error.status >= 500)
    if (!passing) throw error
    await new Promise((resolve) => setTimeout(resolve, wait))
    return task()
  }
}
