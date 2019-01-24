import 'reflect-metadata'
import http from 'http'
import { ApolloServer } from 'apollo-server-express'
import Express from 'express'
import { buildSchema, formatArgumentValidationError } from 'type-graphql'
import { createConnection } from 'typeorm'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { redis } from './redis'
import schedule from 'node-schedule'

import { RegisterResolver } from './modules/user/Register'
import { LoginResolver } from './modules/user/Login'
import { MeResolver } from './modules/user/Me'
import { AllListingsResolver } from './modules/listing/AllListings'
import { RefreshDatabaseResolver } from './modules/listing/RefreshListings'
import { AddFavoriteResolver } from './modules/listing/AddFavorite'
import { RemoveFavoriteResolver } from './modules/listing/RemoveFavorite'
import { LogResolver } from './modules/log/Log'
import { ErrorInterceptor } from './modules/middleware/errorInterceptor'
// import { ResolveTime } from './modules/middleware/timer'

const main = async () => {
  await createConnection()

  const schema = await buildSchema({
    resolvers: [
      MeResolver,
      RegisterResolver,
      LoginResolver,
      AllListingsResolver,
      RefreshDatabaseResolver,
      AddFavoriteResolver,
      RemoveFavoriteResolver,
      LogResolver
    ],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId
    },
    globalMiddlewares: [ErrorInterceptor]
  })

  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError,
    context: ({ req }: any) => ({ req })
  })

  const app = Express()

  const RedisStore = connectRedis(session)

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: 'cats-are-best',
      secret: 'aslkdfjoiq12312',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
      }
    })
  )

  // https://github.com/apollographql/apollo-client/issues/4037
  const corsOptions = { credentials: true, origin: 'http://localhost:8080' }
  apolloServer.applyMiddleware({ app, cors: corsOptions })

  // get sockets going
  const httpServer = http.createServer(app)
  apolloServer.installSubscriptionHandlers(httpServer)

  // schdule every 30 minute loads to Listings
  const refreshListingsTask = schedule.scheduleJob('*/30 * * * *', async () => {
    console.log(`Scheduler ran at ${new Date()}`)
    let dr = new RefreshDatabaseResolver()
    console.log(await dr.refreshDatabase())
  })

  httpServer.listen(4000, () => {
    refreshListingsTask
    console.log(
      `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    )
    console.log(
      `🚀 Subscriptions ready at ws://localhost:4000${
        apolloServer.subscriptionsPath
      }`
    )
  })
}

main()
