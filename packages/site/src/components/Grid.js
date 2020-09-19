import React, { createContext, useContext, useRef } from 'react'
import calendarize from 'calendarize'
import { useItemList } from 'use-item-list'

const GridContext = createContext(null)

const DAYS_IN_WEEK = 7
const CELL_SIZE = 48

function Grid({ children, initialHighlightedIndex }) {
  const itemList = useItemList({
    initialHighlightedIndex,
  })
  return (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        console.log(itemList.items, itemList.getHighlightedIndex())
        const highlightedIndex = itemList.getHighlightedIndex()
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          itemList.setHighlightedItem(highlightedIndex - 1)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          itemList.setHighlightedItem(highlightedIndex + 1)
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          itemList.setHighlightedItem(highlightedIndex - DAYS_IN_WEEK)
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          itemList.setHighlightedItem(highlightedIndex + DAYS_IN_WEEK)
        } else if (event.key === 'Enter') {
          itemList.selectHighlightedItem()
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
        gridAutoRows: CELL_SIZE,
        width: CELL_SIZE * DAYS_IN_WEEK,
      }}
    >
      <GridContext.Provider value={itemList}>{children}</GridContext.Provider>
    </div>
  )
}

function GridCell({ children }) {
  const ref = useRef(null)
  const { useItem } = useContext(GridContext)
  const { useHighlighted } = useItem({
    ref,
    value: children,
  })
  const highlighted = useHighlighted()
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: highlighted ? 'yellow' : undefined,
      }}
    >
      {children}
    </div>
  )
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEK_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const TODAY = new Date()
const MONTH = MONTH_NAMES[TODAY.getMonth()]

export function Demo() {
  const currentMonth = calendarize()
  return (
    <div>
      <h1 style={{ padding: 8, margin: 0 }}>{MONTH}</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
        }}
      >
        {WEEK_NAMES.map((day) => (
          <div
            key={day}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>
      <Grid
        initialHighlightedIndex={currentMonth.flat().indexOf(TODAY.getDate())}
      >
        {currentMonth.map((week) =>
          week
            .filter((day) => day !== 0)
            .map((day) => <GridCell key={day}>{day}</GridCell>)
        )}
      </Grid>
    </div>
  )
}
