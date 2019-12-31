import { Country } from '../entity/Country'

export class MyListing {
  sourceSystem: string
  sourceSystemId: string
  make: string
  model: string
  year: number
  name: string = ''
  price: number
  ownersVersion: boolean = false
  length: number = 0
  beam: number = 0
  draft: number = 0
  displacement: number = 0
  cabins: number = 0
  doubleBerths: number = 0
  heads: number = 0
  locationCity: string = ''
  locationCountryCode: string = ''
  locationCountry: string = ''
  createdDate: Date = new Date()
  modifiedDate: Date = new Date()
  addedDate: Date = new Date()
  url: string = ''
  description: string = ''

  constructor(source: string, record: any) {
    if (source == 'yw') {
      this.fromYW(record)
    } else if (source == 'cc') {
      this.fromCC(record)
    }
  }

  protected fromYW(record: any) {
    this.sourceSystem = 'yw'
    this.sourceSystemId = record.id
    this.make = record.boat.make
    this.model = record.boat.model
    this.year = record.boat.year
    this.name = record.boat.normalizedName
    this.price = record.price.type && record.price.type.amount['USD']
    this.ownersVersion = this.isOwnersVersion(
      record.boat.accommodation.cabins,
      record.descriptionNoHTML
    )
    this.length =
      record.boat.specifications.dimensions.lengths &&
      record.boat.specifications.dimensions.lengths.overall &&
      record.boat.specifications.dimensions.lengths.overall.ft
    this.beam =
      record.boat.specifications.dimensions.beam &&
      record.boat.specifications.dimensions.beam.f
    this.draft =
      record.boat.specifications.dimensions.maxDraft &&
      record.boat.specifications.dimensions.maxDraft.ft
    this.displacement =
      record.boat.specifications.dimensions.weights.displacement &&
      record.boat.specifications.dimensions.weights.displacement.value
    this.cabins = record.boat.accommodation.cabins
    this.doubleBerths = record.boat.accommodation.doubleBerths
    this.heads = record.boat.accommodation.heads
    this.locationCity = record.location.city
    this.locationCountry = ''
    this.locationCountryCode = record.location.countryCode
    this.createdDate = record.date.created
      ? new Date(record.date.created)
      : new Date()
    this.modifiedDate = record.date.modified
      ? new Date(record.date.modified)
      : new Date()
    this.addedDate = new Date()
    this.url = record.mappedURL
    this.description = record.descriptionNoHTML
  }

  protected fromCC(record: any) {
    this.sourceSystem = 'cc'
    this.sourceSystemId = record.id
    this.make = record.make
    this.model = record.model
    this.year = record.year
    this.name = record.name
    this.price = record.price
    this.ownersVersion = this.isOwnersVersion(record.cabins, '')
    this.cabins = record.cabins
    this.heads = record.heads
    this.locationCity = record.location.split(',')[0]
    this.locationCountry = record.location.split(',')[1]
    this.url = record.link
  }

  async getFormattedRecord(): Promise<MyListing> {
    if (this.sourceSystem == 'yw') {
      this.locationCountry = await this.getCountryName(this.locationCountryCode)
    }
    return this
  }

  protected async getCountryName(abbreviation: string): Promise<string> {
    const country = await Country.findOne({ where: { abbreviation } })
    return country && country.name ? country.name : ''
  }

  protected isOwnersVersion(cabins: number, description: string) {
    if (cabins == 3) {
      return true
    } else if (
      description
        .toLowerCase()
        .search(/owners version|owner version|owner's version/) > -1
    ) {
      return true
    } else {
      return false
    }
  }
}
