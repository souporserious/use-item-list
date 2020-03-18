import React, { memo, useMemo } from 'react'
import moment from 'moment'
import * as lodash from 'lodash'

import { Option } from './Select'

function MemoOption({ value }) {
  return useMemo(() => <Option value={value}>Lazy/Memo</Option>, [])
}

export default memo(
  function LazyOption() {
    const time = moment().format('h:mm:ss a')
    const value = `${lodash.add(40, 2)}@${time}`
    return <Option value={value}>Lazy/Memo</Option>
  },
  () => true
)
