import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { useItemList } from 'use-item-list'

const SelectContext = createContext(null)

export function Select({ children, value, onChange }) {
  const itemList = useItemList({
    selected: value,
    onSelect: (item) => onChange(item.value),
  })
  const itemId = itemList.useHighlightedItemId()
  return (
    <SelectContext.Provider value={itemList}>
      <ul
        id={itemList.listId}
        tabIndex={0}
        role="listbox"
        aria-activedescendant={itemId}
        style={{ padding: 0 }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            itemList.moveHighlightedItem(-1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            itemList.moveHighlightedItem(1)
          }
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            itemList.selectHighlightedItem()
          }
          itemList.highlightItemByString(event)
        }}
      >
        {children}
      </ul>
    </SelectContext.Provider>
  )
}

export function Option({ children, text = null, value, disabled = false }) {
  const { useItem, clearHighlightedItem } = useContext(SelectContext)
  const ref = useRef()
  const { id, highlight, select, selected, useHighlighted } = useItem({
    ref,
    text,
    value,
    disabled,
  })
  const highlighted = useHighlighted()
  return (
    <li
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onMouseOver={highlight}
      onMouseOut={clearHighlightedItem}
      onMouseDown={select}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: highlighted ? 'yellow' : 'white',
        fontWeight: selected ? 600 : 400,
        opacity: disabled ? 0.35 : 1,
        cursor: 'pointer',
      }}
    >
      {children} {selected && '✅'}
    </li>
  )
}

const range = (size) => {
  const numbers = []
  for (let i = 0; i < size; i++) {
    numbers.push(i)
  }
  return numbers
}

const items = range(10)

export default function App() {
  const [selectedFruits, setSelectedFruits] = useState([])
  console.log(selectedFruits)
  return (
    <div className="App">
      <Select
        value={(value) => selectedFruits.includes(value)}
        onChange={(value) => {
          setSelectedFruits((currentSelectedFruits) => {
            const nextSelectedFruits = [...currentSelectedFruits]
            const index = currentSelectedFruits.indexOf(value)
            if (index > -1) {
              nextSelectedFruits.splice(index, 1)
            } else {
              nextSelectedFruits.push(value)
            }
            return nextSelectedFruits
          })
        }}
      >
        {items.map((item) => (
          <Option key={item} value={item}>
            {item}
          </Option>
        ))}
      </Select>
    </div>
  )
}
