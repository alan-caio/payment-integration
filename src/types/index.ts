import { Document as MongooseDocument } from 'mongoose';
import { TypeWithID, TypeWithTimestamps } from '../collections/config/types';
import { FileData } from '../uploads/types';

export type Operator = 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'greater_than'
  | 'greater_than_equals'
  | 'less_than'
  | 'less_than_equals'
  | 'like'
  | 'near'

export type WhereField = {
  [key in Operator]?: unknown
}

export type Where = {
  or?: Where[]
  and?: Where[]
  [key: string]: Where[] | WhereField
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Document = any;

export interface PayloadMongooseDocument extends MongooseDocument {
  setLocale: (locale: string, fallback: string) => void
  filename?: string
  sizes?: FileData[]
}

export type Operation = 'create' | 'read' | 'update' | 'delete'

export function docHasTimestamps(doc: any): doc is TypeWithTimestamps {
  return doc?.createdAt && doc?.updatedAt;
}
