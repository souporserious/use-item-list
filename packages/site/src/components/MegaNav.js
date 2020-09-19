import React, { createContext, useContext, useRef, useState } from 'react'
import { useItemList } from 'use-item-list'

const MenuGroupContext = createContext(null)
const MenuItemContext = createContext(null)

function MenuItem({ children }) {
  const ref = useRef()
  const { useItem, clearHighlightedItem } = useContext(MenuItemContext)
  const { id, highlight, select, useHighlighted } = useItem({
    ref,
    value: children,
  })
  const highlighted = useHighlighted()
  return (
    <li
      ref={ref}
      id={id}
      onClick={select}
      onMouseOver={highlight}
      onMouseOut={clearHighlightedItem}
      style={{
        display: 'flex',
        padding: 8,
        marginLeft: -8,
        marginRight: -8,
        backgroundColor: highlighted ? 'pink' : undefined,
      }}
    >
      {children}
    </li>
  )
}

function MenuSubGroup({ title, children }) {
  const menuGroup = useContext(MenuGroupContext)
  const menuItem = useItemList({
    initialHighlightedIndex: null,
    onSelect: (item) => console.log(item),
  })
  menuGroup.useItem({ value: menuItem })
  return (
    <MenuItemContext.Provider value={menuItem}>
      <li>
        <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
        <ul
          style={{
            padding: 0,
            listStyle: 'none',
          }}
        >
          {children}
        </ul>
      </li>
    </MenuItemContext.Provider>
  )
}

function MenuGroup({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuGroup = useItemList()
  return (
    <MenuGroupContext.Provider value={menuGroup}>
      <li
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            const item = menuGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.getHighlightedIndex()
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else {
                menuGroup.moveHighlightedItem(-1)
                const nextItem = menuGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.setHighlightedItem(0)
                }
              }
            }
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            const item = menuGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.getHighlightedIndex()
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else {
                menuGroup.moveHighlightedItem(1)
                const nextItem = menuGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.setHighlightedItem(0)
                }
              }
            }
          }
          if (event.key === 'ArrowUp') {
            const item = menuGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.getHighlightedIndex()
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else if (highlightedIndex === 0) {
                menuGroup.moveHighlightedItem(-1)
                const nextItem = menuGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.moveHighlightedItem(-1)
                }
              } else {
                item.value.moveHighlightedItem(-1)
              }
            }
          }
          if (event.key === 'ArrowDown') {
            const item = menuGroup.getHighlightedItem()
            if (item) {
              const lastIndex = item.value.items.current.length - 1
              const highlightedIndex = item.value.getHighlightedIndex()
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else if (highlightedIndex === lastIndex) {
                menuGroup.moveHighlightedItem(1)
                const nextItem = menuGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.moveHighlightedItem(1)
                }
              } else {
                item.value.moveHighlightedItem(1)
              }
            }
          }
        }}
        onMouseEnter={(event) => {
          setMenuOpen(true)
          event.target.focus()
        }}
        onMouseLeave={(event) => {
          setMenuOpen(false)
          event.target.blur()
        }}
        onFocus={() => setMenuOpen(true)}
        onBlur={() => {
          setMenuOpen(false)
          menuGroup.setHighlightedItem(0)
          const item = menuGroup.getHighlightedItem()
          if (item) {
            item.value.setHighlightedItem(0)
          }
        }}
        style={{
          padding: 8,
          color: menuOpen && 'coral',
        }}
      >
        <h1 style={{ margin: 0 }}>{title}</h1>
        {menuOpen && (
          <ul
            style={{
              listStyle: 'none',
              position: 'absolute',
              top: 'calc(100% + 16px)',
              left: 0,
              width: '100%',
              maxWidth: 960,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridGap: 24,
              padding: 16,
              backgroundColor: '#f1f1f1',
              color: 'black',
            }}
          >
            {children}
          </ul>
        )}
      </li>
    </MenuGroupContext.Provider>
  )
}

function Menu({ children }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'min-content',
        gridGap: 16,
        width: '100%',
        padding: 0,
        position: 'relative',
      }}
    >
      {children}
    </ul>
  )
}

const foodGroups = {
  Fruits: {
    Citrus: ['Oranges', 'Grapefruits', 'Mandarins', 'Limes'],
    Stone: ['Nectarines', 'Apricots', 'Peaches', 'Plums'],
    Tropical: ['Bananas', 'Mangoes'],
    Berries: ['Strawberries', 'Raspberries', 'Blueberries', 'Kiwis'],
    Melons: ['Watermelons', 'Rockmelons', 'Honeydew'],
    Miscellaneous: ['Apples', 'Pears', 'Tomatoes', 'Avocados'],
  },
  Vegetables: {
    Leafy: ['Lettuce', 'Spinach', 'Silverbeet'],
    Cruciferous: ['Cabbage', 'Cauliflower', 'Brussels Sprout', 'Broccoli'],
    Marrow: ['Pumpkin', 'Cucumber', 'Zucchini'],
    Root: ['Potato', 'Sweet Potato'],
    Stem: ['Celery', 'Asparagus'],
    Allium: ['Onion', 'Garlic', 'Shallot'],
  },
  Meats: {
    'Red Meat': ['Beef', 'Goat', 'Lamb'],
    Poultry: ['Chicken', 'Turkey'],
    Pork: [`Pig's meat`],
    Seafood: ['Fish', 'Crab', 'Lobster'],
  },
}

export function Demo() {
  return (
    <Menu>
      {Object.entries(foodGroups).map(([categoryName, categories]) => (
        <MenuGroup key={categoryName} title={categoryName}>
          {Object.entries(categories).map(([groupName, group]) => (
            <MenuSubGroup key={groupName} title={groupName}>
              {group.map((itemName) => (
                <MenuItem key={itemName}>{itemName}</MenuItem>
              ))}
            </MenuSubGroup>
          ))}
        </MenuGroup>
      ))}
    </Menu>
  )
}
