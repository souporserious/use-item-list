import {
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
} from 'react'
import useConstant from 'use-constant'
import mitt from 'mitt'

import { scrollIntoView } from './utils'

const isServer = typeof window !== 'undefined'
const useIsomorphicEffect = isServer ? useEffect : useLayoutEffect

function isNumberKey(event) {
  return event.keyCode >= 48 && event.keyCode <= 57
}

function isLetterKey(event) {
  return event.keyCode >= 65 && event.keyCode <= 90
}

function isSpecialKey(event) {
  return event.keyCode >= 188 && event.keyCode <= 190
}

function isComboKey(event) {
  return event.ctrlKey || event.metaKey || event.altKey
}

function modulo(val, max) {
  return val >= 0 ? val % max : ((val % max) + max) % max
}

function useForceUpdate() {
  const [, forceUpdate] = useState()
  return useCallback(() => forceUpdate(Object.create(null)), [])
}

let localId = 0

export function useItemList({
  id = localId++,
  initialHighlightedIndex = 0,
  onHighlight,
  onSelect,
  selected,
}: {
  id?: Number
  initialHighlightedIndex?: Number
  onHighlight?: Function
  onSelect?: Function
  selected?: Function | any
}) {
  const controllerId = useRef(`controller-${id}`)
  const listId = useRef(`list-${id}`)
  const getItemId = index => `${listId.current}-item-${index}`
  const itemListEmitter = useConstant(() => mitt())
  const itemListForceUpdate = useForceUpdate()
  const highlightedIndex = useRef(initialHighlightedIndex)
  const items = useRef([])
  const shouldCollectItems = useRef(true)
  const invalidatedItems = useRef(false)
  const storeItem = useCallback(({ ref, text, value }) => {
    let itemIndex = items.current.findIndex(item => item.value === value)

    // First, we check if the incoming ref is new and
    // determine if the parent has set shouldCollectRefs or not.
    // If it hasn't, we need to refetch refs by their tree order
    if (
      itemIndex === -1 &&
      items.current.length > 0 &&
      shouldCollectItems.current === false
    ) {
      // stop collecting refs and start over in forced parent render
      // since the collection has been invalidated
      invalidatedItems.current = true
    } else if (itemIndex === -1) {
      itemIndex = items.current.length
      items.current.push({ id: getItemId(itemIndex), ref, text, value })
    }

    return itemIndex
  }, [])

  // clear items on every render before collecting children
  items.current = []
  shouldCollectItems.current = true
  useIsomorphicEffect(() => {
    shouldCollectItems.current = false
  })

  // Select
  useEffect(() => {
    function handleSelect(selectIndex) {
      const item = items.current[selectIndex]
      if (onSelect && item) {
        onSelect(item.value)
      }
    }
    itemListEmitter.on('SELECT_ITEM', handleSelect)
    return () => {
      itemListEmitter.off('SELECT_ITEM', handleSelect)
    }
  }, [onSelect])

  const selectedRef = useRef(null)
  selectedRef.current = selected
  function isItemSelected(value) {
    return typeof selectedRef.current === 'function'
      ? selectedRef.current(value)
      : selectedRef.current === value
  }

  // Highlight
  function setHighlightedItem(index) {
    highlightedIndex.current = index
    itemListEmitter.emit('HIGHLIGHT_ITEM', index)
    if (onHighlight) {
      onHighlight(index)
    }
  }

  function moveHighlightedItem(amount, { contain = true } = {}) {
    const itemCount = items.current.length
    let index = highlightedIndex.current
    if (index === null) {
      index = amount >= 0 ? 0 : itemCount - 1
    } else {
      index += amount
      if (index < 0 || index >= itemCount) {
        index = contain
          ? modulo(highlightedIndex.current + amount, itemCount)
          : null
      }
    }
    setHighlightedItem(index)
  }

  function clearHighlightedItem() {
    setHighlightedItem(null)
  }

  function selectHighlightedItem() {
    if (highlightedIndex.current !== null) {
      itemListEmitter.emit('SELECT_ITEM', highlightedIndex.current)
    }
  }

  function getHighlightedItemId(index) {
    const item = items.current[index]
    if (item) {
      return item.id
    } else {
      return null
    }
  }

  const useHighlightedItemId = useCallback(() => {
    const [highlightedItemId, setHighlightedItemId] = useState(() =>
      getHighlightedItemId(highlightedIndex.current)
    )
    useEffect(() => {
      function handleHighlight(newIndex) {
        setHighlightedItemId(getHighlightedItemId(newIndex))
      }
      itemListEmitter.on('HIGHLIGHT_ITEM', handleHighlight)
      return () => {
        itemListEmitter.off('HIGHLIGHT_ITEM', handleHighlight)
      }
    }, [])
    return highlightedItemId
  }, [])

  // String Search
  const searchString = useRef('')
  const searchStringTimer = useRef<any>(null)

  function highlightItemByString(event, delay = 300) {
    if (
      (isNumberKey(event) || isLetterKey(event) || isSpecialKey(event)) &&
      !isComboKey(event)
    ) {
      event.preventDefault()
      addToSearchString(event.key)
      startSearchStringTimer(delay)
      highlightItemFromString(searchString.current)
    }
  }

  function addToSearchString(letter) {
    searchString.current += letter.toLowerCase()
  }

  function clearSearchString() {
    searchString.current = ''
  }

  function startSearchStringTimer(delay) {
    clearSearchStringTimer()
    searchStringTimer.current = setTimeout(() => {
      clearSearchString()
    }, delay)
  }

  function clearSearchStringTimer() {
    clearTimeout(searchStringTimer.current)
  }

  function highlightItemFromString(text) {
    for (let index = 0; index < items.current.length; index++) {
      const item = items.current[index]
      const itemText = item.text || String(item.value)
      if (itemText.toLowerCase().indexOf(text) === 0) {
        setHighlightedItem(index)
        break
      }
    }
  }

  const useItem = useCallback(({ ref, text, value }) => {
    const itemEmitter = useConstant(() => mitt())
    const forceUpdate = useForceUpdate()
    const itemIndex = storeItem({ ref, text, value })
    const itemIndexRef = useRef<Number>(itemIndex)

    function highlight() {
      setHighlightedItem(itemIndexRef.current)
    }

    function select() {
      itemListEmitter.emit('SELECT_ITEM', itemIndexRef.current)
    }

    useIsomorphicEffect(() => {
      // if collection was invalidated, we need to trigger an update in the parent
      if (invalidatedItems.current) {
        itemListForceUpdate()
        invalidatedItems.current = false
      }
    })

    useIsomorphicEffect(() => {
      // patch the index if new children were added
      if (itemIndexRef.current !== itemIndex) {
        itemIndexRef.current = itemIndex
        forceUpdate()
      }
      itemEmitter.emit('UPDATE_ITEM_INDEX', itemIndex)
    }, [itemIndex])

    useEffect(() => {
      function handleHighlight(newIndex) {
        if (itemIndexRef.current === newIndex) {
          const itemNode = ref.current
          if (itemNode) {
            scrollIntoView(itemNode)
          }
        }
      }
      itemListEmitter.on('HIGHLIGHT_ITEM', handleHighlight)
      return () => {
        itemListEmitter.off('HIGHLIGHT_ITEM', handleHighlight)
      }
    }, [])

    const useHighlighted = useCallback(() => {
      const [highlighted, setHighlighted] = useState<Boolean | null>(null)
      useIsomorphicEffect(() => {
        function handleHighlight(newIndex) {
          setHighlighted(itemIndexRef.current === newIndex)
        }
        function handleIndex(itemIndex) {
          // update the highlight state in case of a mismatch
          const nextHighlighted = highlightedIndex.current === itemIndex
          if (highlighted !== nextHighlighted) {
            setHighlighted(nextHighlighted)
          }
        }
        itemListEmitter.on('HIGHLIGHT_ITEM', handleHighlight)
        itemEmitter.emit('UPDATE_ITEM_INDEX', handleIndex)
        return () => {
          itemListEmitter.off('HIGHLIGHT_ITEM', handleHighlight)
          itemEmitter.off('UPDATE_ITEM_INDEX', handleIndex)
        }
      }, [])
      useIsomorphicEffect(() => {
        const nextHighlighted =
          itemIndexRef.current === highlightedIndex.current
        if (highlighted !== nextHighlighted) {
          setHighlighted(nextHighlighted)
        }
      })
      return highlighted
    }, [])

    return {
      id: getItemId(itemIndex),
      index: itemIndexRef.current,
      highlight,
      select,
      selected: isItemSelected(value),
      useHighlighted,
    }
  }, [])

  return {
    controllerId: controllerId.current,
    listId: listId.current,
    items,
    highlightedIndex,
    setHighlightedItem,
    moveHighlightedItem,
    clearHighlightedItem,
    selectHighlightedItem,
    useHighlightedItemId,
    highlightItemByString,
    useItem,
  }
}
