import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import Express from 'express'
import session from 'express-session'
import http from 'http'
import 'reflect-metadata'
import { buildSchema, formatArgumentValidationError } from 'type-graphql'
import { createConnection } from 'typeorm'
import { ListingResolver } from './modules/listing/Listing'
import { RefreshDatabaseResolver } from './modules/listing/RefreshListings'
import { LogResolver } from './modules/log/Log'
import { ErrorInterceptor } from './modules/middleware/errorInterceptor'
import { LoginResolver } from './modules/user/Login'
import { MeResolver } from './modules/user/Me'
import { RegisterResolver } from './modules/user/Register'
import { redis } from './redis'
import { RefreshListingsTask } from './task'
import { pubsub } from './types/MyPubSub'

const main = async () => {
  await createConnection()

  const schema = await buildSchema({
    resolvers: [
      MeResolver,
      RegisterResolver,
      LoginResolver,
      ListingResolver,
      RefreshDatabaseResolver,
      LogResolver
    ],
    pubSub: pubsub,
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

  httpServer.listen(4000, () => {
    RefreshListingsTask
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
