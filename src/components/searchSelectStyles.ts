import type { StylesConfig, GroupBase } from 'react-select'

export type SelectOption = {
  value: string
  label: string
}

export const searchSelectStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
  container: (base) => ({
    ...base,
    width: '100%',
  }),
  control: (base, state) => ({
    ...base,
    minHeight: 36,
    borderRadius: 6,
    borderColor: state.isFocused ? '#163324' : '#e7e1d7',
    boxShadow: state.isFocused ? '0 0 0 1px #163324' : 'none',
    backgroundColor: '#fcfaf6',
    cursor: 'pointer',
    paddingLeft: 2,
    paddingRight: 2,
    '&:hover': {
      borderColor: state.isFocused ? '#163324' : '#d9d0c3',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 8px',
    gap: 4,
    flexWrap: 'wrap',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1c1e1d',
    fontSize: 13,
    fontWeight: 500,
  }),
  multiValue: (base) => ({
    ...base,
    margin: 0,
    borderRadius: 4,
    backgroundColor: '#e8efea',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#163324',
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 4px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#5c615e',
    borderRadius: 4,
    ':hover': {
      backgroundColor: '#d5e3d9',
      color: '#163324',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#5c615e',
    fontSize: 13,
  }),
  input: (base) => ({
    ...base,
    color: '#1c1e1d',
    fontSize: 13,
    margin: 0,
    padding: 0,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#5c615e',
    padding: 6,
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
    transition: 'transform 0.15s ease',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#5c615e',
    padding: 4,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    border: '1px solid #e7e1d7',
    boxShadow: '0 12px 28px rgba(22, 51, 36, 0.1)',
    overflow: 'hidden',
    zIndex: 20,
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: state.isSelected ? 600 : 500,
    color: state.isSelected ? '#163324' : '#1c1e1d',
    backgroundColor: state.isFocused ? '#f5f0e7' : 'transparent',
    cursor: 'pointer',
    padding: '10px 12px',
    ':active': {
      backgroundColor: '#f5f0e7',
    },
  }),
}
