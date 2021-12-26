import React from 'react';
import { Model, Document } from 'mongoose';
import { DeepRequired } from 'ts-essentials';
import { PayloadRequest } from '../../express/types';
import { Access, GeneratePreviewURL } from '../../config/types';
import { Field } from '../../fields/config/types';
import { IncomingGlobalRevisionsType } from '../../revisions/types';

export type TypeWithID = {
  id: string
}

export type BeforeValidateHook = (args: {
  data?: any;
  req?: PayloadRequest;
  originalDoc?: any;
}) => any;

export type BeforeChangeHook = (args: {
  data: any;
  req: PayloadRequest;
  originalDoc?: any;
}) => any;

export type AfterChangeHook = (args: {
  doc: any;
  req: PayloadRequest;
}) => any;

export type BeforeReadHook = (args: {
  doc: any;
  req: PayloadRequest;
  query: { [key: string]: any };
}) => any;

export type AfterReadHook = (args: {
  doc: any;
  req: PayloadRequest;
  query?: { [key: string]: any };
}) => any;

export type GlobalModel = Model<Document>

export type GlobalConfig = {
  slug: string
  label?: string
  preview?: GeneratePreviewURL
  revisions?: IncomingGlobalRevisionsType | boolean
  hooks?: {
    beforeValidate?: BeforeValidateHook[]
    beforeChange?: BeforeChangeHook[]
    afterChange?: AfterChangeHook[]
    beforeRead?: BeforeReadHook[]
    afterRead?: AfterReadHook[]
  }
  access?: {
    read?: Access;
    readRevisions?: Access;
    update?: Access;
  }
  fields: Field[];
  admin?: {
    description?: string | (() => string);
    components?: {
      views?: {
        Edit?: React.ComponentType
      }
    }
  }
}

export interface SanitizedGlobalConfig extends Omit<DeepRequired<GlobalConfig>, 'fields' | 'revisions'> {
  fields: Field[]
  revisions?: {
    max?: number
  }
}

export type Globals = {
  Model: GlobalModel
  config: SanitizedGlobalConfig[]
}
