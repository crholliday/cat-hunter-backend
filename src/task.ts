import schedule from 'node-schedule'
import config from './config'
import { Log } from './entity/Log'
import { RefreshDatabaseResolver } from './modules/listing/RefreshListings'
import { LogType } from './types/LogType'
import { pubsub } from './types/MyPubSub'

// schdule every 30 minute loads to Listings
export const RefreshListingsTask = schedule.scheduleJob(
  `*/${config.REFRESH_MINUTES} * * * *`,
  async () => {
    console.log(`Scheduler ran at ${new Date()}`)
    let dr = new RefreshDatabaseResolver()
    let res = await dr.refreshDatabase()
    await pubsub.publish('newRefreshDate', { refreshDate: new Date() })
    console.log(res)
    await Log.insert({
      type: LogType.REFRESHDATABASE,
      message: res,
      createdDate: new Date()
    })
  }
)
