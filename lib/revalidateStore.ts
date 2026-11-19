import { revalidatePath } from "next/cache"

/** Purge every cached storefront page so admin changes show up immediately. */
export function revalidateStore() {
  try {
    revalidatePath("/", "layout")
  } catch {
    // never let cache invalidation break a successful write
  }
}

/**
 * Wrap a route handler so a successful (status < 400) response
 * revalidates the storefront cache.
 */
export function withStoreRevalidate<A extends any[]>(
  handler: (...args: A) => Promise<Response> | Response
) {
  return async (...args: A): Promise<Response> => {
    const res = await handler(...args)
    if (res.status < 400) revalidateStore()
    return res
  }
}
