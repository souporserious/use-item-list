import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useItemList } from 'use-item-list'

import data from './data'

// https://www.w3.org/TR/wai-aria-practices-1.1/examples/combobox/aria1.1pattern/listbox-combo.html

const ComboboxContext = createContext()

function Combobox({ children, onSelect }) {
  const itemList = useItemList({ onSelect })
  return (
    <ComboboxContext.Provider value={itemList}>
      {children}
    </ComboboxContext.Provider>
  )
}

function Input({ autoComplete, autoSelect, value, onChange }) {
  const {
    controllerId,
    listId,
    moveHighlightedItem,
    setHighlightedItem,
    selectHighlightedItem,
    useHighlightedItemId,
  } = useContext(ComboboxContext)
  const itemId = useHighlightedItemId()
  useEffect(() => {
    setHighlightedItem(0)
  }, [value])
  return (
    <input
      id={controllerId}
      aria-autocomplete="list"
      aria-controls={listId}
      aria-activedescendant={itemId}
      value={value}
      onChange={onChange}
      onKeyDown={event => {
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          moveHighlightedItem(-1)
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          moveHighlightedItem(1)
        } else if (event.key === 'Enter') {
          selectHighlightedItem()
        }
      }}
    />
  )
}

function List({ children }) {
  const { listId, controllerId } = useContext(ComboboxContext)
  return (
    <ul
      id={listId}
      role="listbox"
      aria-labelledby={controllerId}
      tabIndex={0}
      style={{
        height: 200,
        padding: 0,
        overflow: 'auto',
      }}
    >
      {children}
    </ul>
  )
}

function Option({ children, value }) {
  const ref = useRef()
  const { useItem, clearHighlightedItem } = useContext(ComboboxContext)
  const { id, index, highlight, select, useHighlighted } = useItem({
    ref,
    value,
  })
  const highlighted = useHighlighted()
  return (
    <li
      ref={ref}
      id={id}
      role="option"
      aria-selected={highlighted}
      onMouseOver={highlight}
      onMouseOut={clearHighlightedItem}
      onMouseDown={select}
      style={{
        display: 'flex',
        padding: 8,
        backgroundColor: highlighted ? 'yellow' : 'white',
      }}
    >
      {index} {children}
    </li>
  )
}

export function Demo() {
  const [inputValue, setInputValue] = useState('')
  const filteredData = data.filter(
    item =>
      !inputValue || item.name.toLowerCase().includes(inputValue.toLowerCase())
  )
  return (
    <Combobox onSelect={value => setInputValue(value.name)}>
      <div>
        <Input
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
        />
        <List>
          {filteredData.length > 0
            ? filteredData.map(item => (
                <Option key={item.id} value={item}>
                  {item.name}
                </Option>
              ))
            : 'No results found'}
        </List>
      </div>
    </Combobox>
  )
}
