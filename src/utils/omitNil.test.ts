import { describe, expect, it } from 'vitest'
import { omitNil } from './omitNil'

describe('omitNil', () => {
  it('empty object', () => {
    const values = {}
    expect(omitNil(values)).toStrictEqual({})
  })

  it('nest object', () => {
    const values = {
      a: 1,
      b: undefined,
      c: null,
      d: {
        d1: [],
        d2: undefined,
        d3: null,
        d4: [
          {},
          {},
        ],
        d5: [
          { a: undefined, b: null },
          { a: undefined, b: null, c: 1 },
        ],
      },
      e: [
        { a: undefined, b: null },
        { a: undefined, b: null, c: 1 },
        {
          a: undefined,
          b: null,
          c: [
            { a: undefined, b: null },
            { a: undefined, b: null, c: 1 },
          ],
        },
      ],
    }
    expect(omitNil(values)).toStrictEqual({
      a: 1,
      d: {
        d1: [],
        d4: [
          {},
          {},
        ],
        d5: [
          { },
          { c: 1 },
        ],
      },
      e: [
        { },
        { c: 1 },
        {
          c: [
            { },
            { c: 1 },
          ],
        },
      ],
    })
  })
})
