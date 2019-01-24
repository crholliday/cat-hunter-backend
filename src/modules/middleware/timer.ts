import { MiddlewareFn } from 'type-graphql'

export const ResolveTime: MiddlewareFn = async ({ info }, next) => {
  let start = Date.now()
  return next().then(() => {
    const resolveTime = Date.now() - start
    console.log(`${info.parentType.name}.${info.fieldName} [${resolveTime} ms]`)
  })
}
