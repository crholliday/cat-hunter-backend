import { registerEnumType } from 'type-graphql'

export enum LogType {
  GENERAL = 'general',
  EVENT = 'event',
  ERROR = 'error',
  REFRESHDATABASE = 'refreshDatabase'
}

registerEnumType(LogType, {
  name: 'LogType', // this one is mandatory
  description: 'Type of message being logged' // this one is optional
})
