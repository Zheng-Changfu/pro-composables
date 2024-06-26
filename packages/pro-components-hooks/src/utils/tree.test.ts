import { describe, expect, it } from 'vitest'
import { mapTree } from './tree'

describe('tree', () => {
  it('map', () => {
    const data = [
      {
        label: '道生一',
        key: 'xyknzobcn24',
        children: [
          {
            label: '一生二',
            key: 's7plffoqp7n',
            children: [
              {
                label: '二生三',
                key: 'objecju8j1z',
                children: [],
              },
            ],
          },
        ],
      },
    ]
    const normalizedData = mapTree(
      data,
      (item) => {
        return {
          ...item,
          a: 1,
        }
      },
      'children',
    )
    expect(normalizedData).toStrictEqual([
      {
        label: '道生一',
        key: 'xyknzobcn24',
        a: 1,
        children: [
          {
            label: '一生二',
            key: 's7plffoqp7n',
            a: 1,
            children: [
              {
                label: '二生三',
                key: 'objecju8j1z',
                children: [],
                a: 1,
              },
            ],
          },
        ],
      },
    ])
  })
})
