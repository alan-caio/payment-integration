import React from 'react';
import { FieldPermissions } from '../../../../../../auth';

export type FieldComponents = Record<string, React.FC<Props>>

export type Props = {
  fieldComponents: FieldComponents
  revision: any
  comparison: any
  field: any
  permissions?: Record<string, FieldPermissions>
  locale?: string
  locales?: string[]
  disableGutter?: boolean
  format?: boolean
}
