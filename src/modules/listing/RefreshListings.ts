import axios from 'axios'
import $ from 'cheerio'
import { Mutation, Resolver, UseMiddleware } from 'type-graphql'
import config from '../../config'
import { Listing } from '../../entity/Listing'
import { MyListing } from '../../types/MyListing'
import { pubsub } from '../../types/MyPubSub'
import { isAuth } from '../middleware/isAuth'
import { logger } from '../middleware/logger'

@Resolver()
export class RefreshDatabaseResolver {
  @UseMiddleware(isAuth, logger)
  @Mutation(() => String)
  async refreshDatabase(): Promise<string> {
    const existingYWIds = await Listing.find({
      select: ['sourceSystemId', 'modifiedDate'],
      where: { sourceSystem: 'yw' }
    })

    const existingCCIds = await Listing.find({
      select: ['sourceSystemId', 'modifiedDate'],
      where: { sourceSystem: 'cc' }
    })

    let page = 1
    let last = 100
    let sourceListings: Listing[] = []

    let ccListings = await this.getCCListings(existingCCIds)
    if (sourceListings.length > 0) {
      sourceListings = sourceListings.concat(ccListings)
    } else {
      sourceListings = ccListings
    }

    do {
      let { lastPage, listings } = await this.getYWListingsByPage(
        page,
        existingYWIds
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
          let items = await Listing.save(sourceListings)
          items.forEach(async i => await pubsub.publish('newListing', i))
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

  getYWListingsByPage = async (page: number, ids: Listing[]) => {
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
        price: '200000-600000',
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

  getCCListings = async (ids: Listing[]) => {
    const url =
      'https://www.catamarans.com/catamarans-for-sale/catamarans-all-listing-search-boats.aspx?strLengthFrom=40&strLengthTo=48&strPriceFrom=200000&strPriceTo=600000&strManufact=&strName=&strLocation=&strPowerOrSail=Sail&strConditionAll=&strCurrSymbol=USD&SourceSearch=OTHERS&SourceCategory='

    const res = await axios.get(url)
    const records = $('article article', '.row-same-height', res.data)
    const p_results = records.get().map(record => this.recordBuilder(record))
    const results = await Promise.all(p_results)

    const newRecords: any[] = []

    for (let element of results) {
      if (ids.length < 1) {
        let boat = new MyListing('cc', element)
        let formattedBoat = await boat.getFormattedRecord()
        newRecords.push(formattedBoat)
      } else {
        let index = ids.findIndex(i => i.sourceSystemId == <string>element.id)
        if (index < 0) {
          let boat = new MyListing('cc', element)
          let formattedBoat = await boat.getFormattedRecord()
          newRecords.push(formattedBoat)
        }
      }
    }
    console.log(`newRecords count: ${newRecords.length}`)
    return newRecords
  }

  recordBuilder = async (record: any): Promise<any> => {
    const name = $('h2', record)
      .text()
      .trim()
      .replace(/"+/g, '')
      .toLowerCase()

    const price = $('h4', record)
      .text()
      .trim()
      .replace(/\s+|Price:|\$|€|,/g, '')
      .trim()

    const year = $('p.small', record)
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4)

    const id = $('a', record)
      .attr('href')
      .split('=')[1]

    const link =
      'https://www.catamarans.com/catamarans-for-sale/catamaran-preview-basic-info.aspx?Vessel_id=' +
      id

    const make = $('p.small', record)
      .children()
      .eq(0)
      .text()
      .toLowerCase()

    const model = $('p.small a', record)
      .eq(3)
      .text()
      .toLowerCase()

    const city = $('p.small a', record)
      .eq(4)
      .text()

    const state = $('p.small a', record)
      .eq(5)
      .text()

    const res = await axios.get(link)

    const { cabins, heads } = this.getCabinsHeads(res)

    return {
      name: name,
      price: price,
      year: year,
      link: link,
      id: id,
      make: make,
      model: model,
      cabins: cabins,
      heads: heads,
      location: city + ', ' + state
    }
  }

  getCabinsHeads = (res: any) => {
    const table = $('table', res.data).get(1)

    let cabinsRow = $('td', table)
      .filter(function(_, td) {
        return $(td).text() == 'No of Cabins:'
      })
      .closest('tr')

    let headsRow = $('td', table)
      .filter(function(_, td) {
        return $(td).text() == 'No of Heads:'
      })
      .closest('tr')

    let cabins =
      $('td', cabinsRow)
        .last()
        .text() || '0'
    let heads =
      $('td', headsRow)
        .last()
        .text() || '0'

    return { cabins: cabins, heads: heads }
  }
}
