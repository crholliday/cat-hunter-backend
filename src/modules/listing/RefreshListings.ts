import config from '../../config'
import axios from 'axios'
import { Resolver, UseMiddleware, Mutation } from 'type-graphql'

import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'
import { Listing } from '../../entity/Listing'
import { MyListing } from '../../types/MyListing'

@Resolver()
export class RefreshDatabaseResolver {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => String)
  async refreshDatabase(): Promise<string> {
    const existingIds = await Listing.find({
      select: ['sourceSystemId', 'modifiedDate'],
      where: { sourceSystem: 'yw' }
    })

    let page = 1
    let last = 100
    let sourceListings: Listing[] = []

    do {
      let { lastPage, listings } = await this.getNewListingsByPage(
        page,
        existingIds
      )
      if (listings && listings.length > 0) {
        if (sourceListings.length > 0) {
          sourceListings = sourceListings.concat(listings)
        } else {
          sourceListings = listings
        }
      }

      last = lastPage

      if (page === last) {
        if (sourceListings.length > 0) {
          console.log(`Found some new listings...`)
          Listing.save(sourceListings)
          return `${sourceListings.length} records added.`
        } else {
          return 'No new records found.'
        }
      } else {
        page++
      }
    } while (page <= last)

    return 'Something went wrong.'
  }

  getNewListingsByPage = async (page: number, ids: Listing[]) => {
    let requestQuery = {
      method: 'get',
      url: 'https://api-gateway.boats.com/api-yachtworld/search',
      params: {
        apikey: config.API_KEY,
        uom: 'ft',
        currency: 'USD',
        condition: 'used',
        year: '2000-',
        length: '40-50',
        price: '200000-400000',
        created: '-120',
        boatType: 'sail',
        class: 'sail-catamaran',
        page: page,
        pageSize: 50
      }
    }
    const response = await axios(requestQuery)
    const lastPage = response.data.search.lastPage

    // check if each item is already in our json
    const newRecords: any[] = []

    response.data.search.records.forEach((element: any) => {
      let index = ids.findIndex(i => i.sourceSystemId == <string>element.id)
      if (index === -1) {
        newRecords.push(element)
      } else if (ids[index].modifiedDate < element.modifiedDate) {
        newRecords.push(element)
      }
    })

    let newFormattedBoats: any[] = []

    for (let listing of newRecords) {
      let boat = new MyListing('yw', listing)
      let formattedBoat = await boat.getFormattedRecord()
      newFormattedBoats.push(formattedBoat)
    }

    return {
      lastPage: lastPage,
      listings: newFormattedBoats
    }
  }
}
