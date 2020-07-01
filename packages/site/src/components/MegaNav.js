import React, { createContext, useContext, useRef } from 'react'
import { useItemList } from 'use-item-list'

const MenuGroupContext = createContext(null)
const MenuSubGroupContext = createContext(null)
const MenuItemContext = createContext(null)

function MenuItem({ children }) {
  const ref = useRef()
  const { useItem, clearHighlightedItem } = useContext(MenuItemContext)
  const { id, highlight, useHighlighted } = useItem({ ref, value: children })
  const highlighted = useHighlighted()
  return (
    <li
      ref={ref}
      id={id}
      role="option"
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
  const menuSubGroup = useContext(MenuSubGroupContext)
  const menuItem = useItemList({ initialHighlightedIndex: null })
  menuSubGroup.useItem({ value: menuItem })
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
  const ref = useRef()
  const menuGroup = useContext(MenuGroupContext)
  const { id, highlight, useHighlighted } = menuGroup.useItem({
    ref,
    value: children,
  })
  const menuSubGroup = useItemList()
  const highlighted = useHighlighted()
  return (
    <MenuSubGroupContext.Provider value={menuSubGroup}>
      <li
        ref={ref}
        id={id}
        tabIndex={0}
        role="option"
        aria-selected={highlighted}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            const item = menuSubGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.highlightedIndex.current
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else {
                menuSubGroup.moveHighlightedItem(-1)
                const nextItem = menuSubGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.setHighlightedItem(0)
                }
              }
            }
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            const item = menuSubGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.highlightedIndex.current
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else {
                menuSubGroup.moveHighlightedItem(1)
                const nextItem = menuSubGroup.getHighlightedItem()
                if (nextItem) {
                  item.value.clearHighlightedItem()
                  nextItem.value.setHighlightedItem(0)
                }
              }
            }
          }
          if (event.key === 'ArrowUp') {
            const item = menuSubGroup.getHighlightedItem()
            if (item) {
              const highlightedIndex = item.value.highlightedIndex.current
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else if (highlightedIndex === 0) {
                menuSubGroup.moveHighlightedItem(-1)
                const nextItem = menuSubGroup.getHighlightedItem()
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
            const item = menuSubGroup.getHighlightedItem()
            if (item) {
              const lastIndex = item.value.items.current.length - 1
              const highlightedIndex = item.value.highlightedIndex.current
              if (highlightedIndex === null) {
                item.value.setHighlightedItem(0)
              } else if (highlightedIndex === lastIndex) {
                menuSubGroup.moveHighlightedItem(1)
                const nextItem = menuSubGroup.getHighlightedItem()
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
        onMouseEnter={highlight}
        onFocus={highlight}
        onBlur={menuGroup.clearHighlightedItem}
        style={{
          padding: 8,
          color: highlighted && 'coral',
        }}
      >
        <h1 style={{ margin: 0 }}>{title}</h1>
        {highlighted && (
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
    </MenuSubGroupContext.Provider>
  )
}

function Menu({ children }) {
  const menuGroup = useItemList({
    onHighlight: (item) => item && item.ref.current.focus(),
  })
  return (
    <MenuGroupContext.Provider value={menuGroup}>
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
    </MenuGroupContext.Provider>
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
