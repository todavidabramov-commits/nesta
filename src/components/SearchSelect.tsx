'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Select, {
  components,
  type ActionMeta,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type SingleValue,
  type StylesConfig,
  type ValueContainerProps,
} from 'react-select'

import { searchSelectStyles, type SelectOption } from '@/components/searchSelectStyles'
import { useLocale } from '@/i18n/locale-context'

type SearchSelectProps = {
  name: string
  options: SelectOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  instanceId: string
  isClearable?: boolean
  isMulti?: boolean
  menuPortal?: boolean
}

function toList(value: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

function sameList(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path
        d="M3 8.2 6.4 11.5 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MultiOption(props: OptionProps<SelectOption, true, GroupBase<SelectOption>>) {
  return (
    <components.Option {...props}>
      <span className="nesta-select__option">
        <span className="nesta-select__check" aria-hidden>
          {props.isSelected ? <CheckIcon /> : null}
        </span>
        <span className="nesta-select__option-label">{props.label}</span>
      </span>
    </components.Option>
  )
}

function MultiValueContainer({
  selectedLabel,
  ...props
}: ValueContainerProps<SelectOption, true, GroupBase<SelectOption>> & {
  selectedLabel: string
}) {
  const count = props.getValue().length
  return (
    <components.ValueContainer {...props}>
      {count > 0 ? (
        <span className="nesta-select__summary">
          {selectedLabel.replace('{count}', String(count))}
        </span>
      ) : null}
      {props.children}
    </components.ValueContainer>
  )
}

export function SearchSelect({
  name,
  options,
  value,
  onChange,
  placeholder,
  instanceId,
  isClearable = true,
  isMulti = false,
  menuPortal = false,
}: SearchSelectProps) {
  const { messages } = useLocale()
  const portalTarget = menuPortal && typeof document !== 'undefined' ? document.body : undefined
  const propValues = toList(value)
  const propKey = propValues.join('\0')

  const [localValues, setLocalValues] = useState(propValues)
  const [menuOpen, setMenuOpen] = useState(false)
  const localRef = useRef(localValues)
  const propKeyRef = useRef(propKey)
  const pickingRef = useRef(false)

  useEffect(() => {
    if (propKeyRef.current === propKey) return
    propKeyRef.current = propKey
    const next = toList(value)
    setLocalValues(next)
    localRef.current = next
  }, [propKey, value])

  const selectedMulti = useMemo(
    () => options.filter((option) => localValues.includes(option.value)),
    [options, localValues],
  )
  const selectedSingle = useMemo(
    () => options.find((option) => option.value === propValues[0]) || null,
    [options, propValues],
  )

  const styles = useMemo((): StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> => {
    return {
      ...searchSelectStyles,
      menu: (base, props) => ({
        ...(typeof searchSelectStyles.menu === 'function'
          ? searchSelectStyles.menu(base, props)
          : base),
        zIndex: 80,
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 80,
      }),
      option: (base, state) => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
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
      placeholder: (base) => ({
        ...base,
        color: '#5c615e',
        fontSize: 13,
        fontWeight: 500,
      }),
    }
  }, [])

  function applyLocal(next: string[]) {
    setLocalValues(next)
    localRef.current = next
  }

  function commitIfNeeded() {
    const next = localRef.current
    if (sameList(next, propValues)) return
    propKeyRef.current = next.join('\0')
    onChange(next)
  }

  return (
    <>
      {(isMulti ? localValues : propValues).map((item) => (
        <input key={`${name}-${item}`} type="hidden" name={name} value={item} />
      ))}
      {isMulti ? (
        <Select<SelectOption, true>
          instanceId={instanceId}
          inputId={instanceId}
          options={options}
          value={selectedMulti}
          onChange={(next: MultiValue<SelectOption>, meta: ActionMeta<SelectOption>) => {
            if (
              meta.action === 'select-option' ||
              meta.action === 'deselect-option' ||
              meta.action === 'pop-value' ||
              meta.action === 'remove-value'
            ) {
              pickingRef.current = true
              window.setTimeout(() => {
                pickingRef.current = false
              }, 50)
            }
            applyLocal(next.map((option) => option.value))
            if (meta.action === 'clear') {
              propKeyRef.current = ''
              onChange([])
            }
          }}
          placeholder={placeholder}
          isClearable={isClearable}
          isMulti
          isSearchable={false}
          closeMenuOnSelect={false}
          blurInputOnSelect={false}
          hideSelectedOptions={false}
          controlShouldRenderValue={false}
          menuIsOpen={menuOpen}
          onMenuOpen={() => setMenuOpen(true)}
          onMenuClose={() => {
            if (pickingRef.current) {
              setMenuOpen(true)
              return
            }
            setMenuOpen(false)
            commitIfNeeded()
          }}
          components={{
            Option: MultiOption,
            MultiValue: () => null,
            Placeholder: (props) =>
              props.getValue().length > 0 ? null : <components.Placeholder {...props} />,
            ValueContainer: (props) => (
              <MultiValueContainer {...props} selectedLabel={messages.search.filterSelected} />
            ),
          }}
          styles={styles}
          classNamePrefix="nesta-select"
          menuPortalTarget={portalTarget}
          menuPosition={menuPortal ? 'fixed' : undefined}
        />
      ) : (
        <Select<SelectOption, false>
          instanceId={instanceId}
          inputId={instanceId}
          options={options}
          value={selectedSingle}
          onChange={(next: SingleValue<SelectOption>) => onChange(next?.value || '')}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={false}
          styles={styles}
          classNamePrefix="nesta-select"
          menuPortalTarget={portalTarget}
          menuPosition={menuPortal ? 'fixed' : undefined}
        />
      )}
    </>
  )
}
