import React, {
  Suspense,
  lazy,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'
import { useItemList } from 'use-item-list'

const SelectContext = createContext(null)

export function Select({ children, value, onChange }) {
  const itemList = useItemList({
    selected: value,
    onSelect: onChange,
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

export function Option({ children, text, value, disabled }) {
  const { useItem, clearHighlightedItem } = useContext(SelectContext)
  const ref = useRef()
  const { id, index, highlight, select, selected, useHighlighted } = useItem({
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
        padding: 8,
        backgroundColor: highlighted ? 'yellow' : 'white',
        fontWeight: selected ? 600 : 400,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {index} {children} {selected && '✅'}
    </li>
  )
}

const LazyOption = lazy(() => import('../components/LazyOption'))
const assortedFruits = ['Apple', 'Orange', 'Pear', 'Kiwi', 'Banana', 'Mango']
const staticObjectValue = { foo: 'bar' }

export function Demo() {
  const [fruits, setFruits] = useState(assortedFruits.slice(1, 4))
  const [selectedFruits, setSelectedFruits] = useState([])
  return (
    <div>
      <button onClick={() => setFruits(assortedFruits)}>Add more fruits</button>
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
        {fruits.map((fruit) => (
          <Option
            key={fruit}
            value={fruit}
            disabled={['Pear', 'Kiwi'].includes(fruit)}
          >
            {fruit}
          </Option>
        ))}
        <Option value={staticObjectValue} text="Foo/Bar">
          Foo/Bar
        </Option>
        {typeof window === 'undefined' ? (
          'Fetching Suspense option...'
        ) : (
          <Suspense fallback="Fetching Suspense option...">
            <LazyOption />
          </Suspense>
        )}
        <Option value="a">A</Option>
        <Option value="b">B</Option>
        <Option value="c">C</Option>
      </Select>
    </div>
  )
}
