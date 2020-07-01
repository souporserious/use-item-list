# 🕹 useItemList

A primitive React hook used to coordinate indexed collections effortlessly.

## Why?

The ergonmics of managing indexes in React is lacking. When building lower level components for accessibility purposes, managing indexes can become painful and expose internals of an API that consumers shouldn't necessarily need to know about.

This library aims to solve managing indexed collections of items as easily as possible while letting users still compose, optimize, and use React like they are used to.

## API

```jsx
import React, { useRef } from 'react'
import { useItemList } from 'use-item-list'

function Item({ useItem, children }) {
  const ref = useRef()
  const { id, index, highlight, select, selected, useHighlighted } = useItem({
    ref,
    value: children,
  })
  return (
    <li ref={ref} id={id}>
      {children}
    </li>
  )
}

function App() {
  const {
    controllerId,
    listId,
    getHighlightedIndex,
    getHighlightedItem,
    setHighlightedItem,
    moveHighlightedItem,
    clearHighlightedItem,
    selectHighlightedItem,
    useHighlightedItemId,
    highlightItemByString,
    useItem,
  } = useItemList()
  return (
    <ul>
      <Item useItem={useItem}>Item 1</Item>
      <Item useItem={useItem}>Item 2</Item>
      <Item useItem={useItem}>Item 3</Item>
    </ul>
  )
}
```

## Usage

In a somewhat trivial example, we can see how to build a custom select menu:

```jsx
import React, { createContext, useContext, useRef } from 'react'
import { useItemList } from 'use-item-list'

const SelectContext = createContext()

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

export function Option({ children, text, value }) {
  const { useItem, clearHighlightedItem } = useContext(SelectContext)
  const ref = useRef()
  const { id, highlight, select, selected, useHighlighted } = useItem({
    ref,
    text,
    value,
  })
  const highlighted = useHighlighted()
  return (
    <li
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      onMouseOver={highlight}
      onMouseOut={clearHighlightedItem}
      onMouseDown={select}
    >
      {children} {selected && '✅'}
    </li>
  )
}
```

Now users of our component have an easy-to-use API that resembles the ergonomics of the web's select element:

```jsx
<Select>
  <Option value="apple">Apple 🍎</Option>
  <Option value="banana">Banana 🍌</Option>
  <Option value="pear">Pear 🍐</Option>
</Select>
```

Please note this is not a fully accessible example. See the examples directory for more full-fledged examples.
