import React from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { A11yAnnouncer, A11y, useA11y } from '@react-three/a11y'
import { useItemList } from 'use-item-list'

const ItemListContext = React.createContext(null)

function InnerBox({ innerRef, item, ...props }) {
  const ally = useA11y()
  const itemList = React.useContext(ItemListContext)
  const highlighted = item.useHighlighted()

  // ideally we'd use a pooled listener
  React.useEffect(() => {
    function handlKeyDown(event) {
      if (ally.focus) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          itemList.moveHighlightedItem(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          itemList.moveHighlightedItem(1)
        }
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          itemList.selectHighlightedItem()
        }
        itemList.highlightItemByString(event)
      }
    }
    document.addEventListener('keydown', handlKeyDown)
    return () => {
      document.removeEventListener('keydown', handlKeyDown)
    }
  }, [ally.focus])

  return (
    <mesh
      {...props}
      ref={innerRef}
      scale={highlighted ? [1.5, 1.5, 1.5] : [1, 1, 1]}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={item.selected ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Box({ value, ...props }) {
  const itemList = React.useContext(ItemListContext)
  const ref = React.useRef()
  const item = itemList.useItem({ ref, value })

  useFrame(() => {
    ref.current.rotation.x = ref.current.rotation.y += 0.01
  })

  return (
    <A11y
      role="button"
      actionCall={() => item.select()}
      focusCall={() => item.highlight()}
    >
      <InnerBox innerRef={ref} item={item} {...props} />
    </A11y>
  )
}

function Page() {
  const [selected, setSelected] = React.useState([])
  const itemList = useItemList({
    selected: (value) => selected.includes(value),
    onSelect: ({ value }) => {
      setSelected((currentSelected) => {
        const nextSelected = [...currentSelected]
        const index = currentSelected.indexOf(value)
        if (index > -1) {
          nextSelected.splice(index, 1)
        } else {
          nextSelected.push(value)
        }
        return nextSelected
      })
    },
  })
  return (
    <>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ItemListContext.Provider value={itemList}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Box position={[-3, 0, 0]} value={1} />
          <Box position={[0, 0, 0]} value={2} />
          <Box position={[3, 0, 0]} value={3} />
        </ItemListContext.Provider>
      </Canvas>
      <A11yAnnouncer />
    </>
  )
}

export default Page
