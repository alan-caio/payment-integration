import { OptionsType, GroupedOptionsType } from 'react-select';

export type Options = OptionsType<Value> | GroupedOptionsType<Value>;

export type Value = {
  label: string
  value: string
  options?: Options
}

export type Props = {
  className?: string
  value?: Value | Value[],
  onChange?: (value: any) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
  disabled?: boolean,
  showError?: boolean,
  options: Options
  isMulti?: boolean,
  isDisabled?: boolean
  onInputChange?: (val: string) => void
  onMenuScrollToBottom?: () => void
  placeholder?: string
}
