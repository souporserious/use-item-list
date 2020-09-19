import React, { Fragment, StrictMode } from 'react'

import { Demo as ComboboxDemo } from '../components/Combobox'
import { Demo as GridDemo } from '../components/Grid'
import { Demo as MegaNavDemo } from '../components/MegaNav'
import { Demo as SelectDemo } from '../components/Select'

const isStrict = false
const Wrapper = isStrict ? StrictMode : Fragment

function App() {
  return (
    <Wrapper>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '1fr',
          gridGap: 32,
          justifyItems: 'center',
          padding: 32,
        }}
      >
        <GridDemo />
        <ComboboxDemo />
        <MegaNavDemo />
        <SelectDemo />
      </div>
    </Wrapper>
  )
}

export default App
