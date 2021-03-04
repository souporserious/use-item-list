import React, { Fragment, StrictMode, useState } from 'react'

import { Demo as ComboboxDemo } from '../components/Combobox'
import { Demo as GridDemo } from '../components/Grid'
import { Demo as MegaNavDemo } from '../components/MegaNav'
import { Demo as SelectDemo } from '../components/Select'

function App() {
  const [strict, setStrict] = useState(false)
  const Wrapper = strict ? StrictMode : Fragment
  return (
    <Wrapper>
      <label>
        <input
          type="checkbox"
          checked={strict}
          onChange={() => setStrict(!strict)}
        />
        <span>Strict Mode</span>
      </label>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '1fr',
          gridGap: 32,
          alignItems: 'start',
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
