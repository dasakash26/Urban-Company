export async function resolveParams<T>(params: Promise<T> | T): Promise<T> {
  return Promise.resolve(params)
}
