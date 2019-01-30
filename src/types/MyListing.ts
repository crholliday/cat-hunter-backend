import { Country } from '../entity/Country'

export class MyListing {
  sourceSystem: string
  sourceSystemId: string
  make: string
  model: string
  year: number
  name: string
  price: number
  ownersVersion: boolean
  length: number
  beam: number
  draft: number
  displacement: number
  cabins: number
  doubleBerths: number
  heads: number
  locationCity: string
  locationCountryCode: string
  locationCountry: string
  createdDate: Date
  modifiedDate: Date
  addedDate: Date
  url: string
  description: string

  constructor(source: string, record: any) {
    // console.log(`In the constructor for MyListing: ${record}`)
    ;(this.sourceSystem = source),
      (this.sourceSystemId = record.id),
      (this.make = record.boat.make),
      (this.model = record.boat.model),
      (this.year = record.boat.year),
      (this.name = record.boat.normalizedName),
      (this.price = record.price.type && record.price.type.amount['USD']),
      (this.ownersVersion = this.isOwnersVersion(
        record.boat.accommodation.cabins,
        record.descriptionNoHTML
      )),
      (this.length =
        record.boat.specifications.dimensions.lengths &&
        record.boat.specifications.dimensions.lengths.overall &&
        record.boat.specifications.dimensions.lengths.overall.ft),
      (this.beam =
        record.boat.specifications.dimensions.beam &&
        record.boat.specifications.dimensions.beam.ft),
      (this.draft =
        record.boat.specifications.dimensions.maxDraft &&
        record.boat.specifications.dimensions.maxDraft.ft),
      (this.displacement =
        record.boat.specifications.dimensions.weights.displacement &&
        record.boat.specifications.dimensions.weights.displacement.value),
      (this.cabins = record.boat.accommodation.cabins),
      (this.doubleBerths = record.boat.accommodation.doubleBerths),
      (this.heads = record.boat.accommodation.heads),
      (this.locationCity = record.location.city),
      (this.locationCountry = ''),
      (this.locationCountryCode = record.location.countryCode),
      (this.createdDate = record.date.created
        ? new Date(record.date.created)
        : new Date()),
      (this.modifiedDate = record.date.modified
        ? new Date(record.date.modified)
        : new Date()),
      (this.addedDate = new Date()),
      (this.url = record.mappedURL),
      (this.description = record.descriptionNoHTML)
  }

  async getFormattedRecord(): Promise<MyListing> {
    this.locationCountry = await this.getCountryName(this.locationCountryCode)
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
