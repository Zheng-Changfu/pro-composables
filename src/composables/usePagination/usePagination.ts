import { computed } from 'vue'
import { useRequest } from '../useRequest'
import type { Data, PaginationOptions, PaginationResult, Params, Service } from './types'

export function usePagination<
  TData extends Data,
  TParams extends Params,
>(
  service: Service<TData, TParams>,
  options: PaginationOptions<TData, TParams> = {},
) {
  const {
    defaultCurrent = 1,
    defaultPageSize = 10,
    ...rest
  } = options

  const result = useRequest(service, {
    defaultParams: [{ current: defaultCurrent, pageSize: defaultPageSize }] as any,
    refreshDepsAction: () => {
      changeCurrent(1)
    },
    ...rest,
  })

  const total = computed(() => {
    return result.data.value?.total ?? 0
  })

  const current = computed({
    get() {
      return (result.params.value[0] ?? {}).current ?? defaultCurrent
    },
    set(val) {
      changeCurrent(val)
    },
  })

  const pageSize = computed({
    get() {
      return (result.params.value[0] ?? {}).pageSize ?? defaultPageSize
    },
    set(val) {
      changePageSize(val)
    },
  })

  const totalPage = computed(() => {
    const total = result.data.value?.total ?? 0
    return Math.ceil(total / pageSize.value)
  })

  function onChange(c: number, p: number) {
    let toCurrent = c <= 0 ? 1 : c
    const toPageSize = p <= 0 ? 1 : p
    const tempTotalPage = Math.ceil(total.value / toPageSize)
    if (toCurrent > tempTotalPage) {
      toCurrent = Math.max(1, tempTotalPage)
    }

    const [oldPaginationParams = {}, ...restParams] = result.params.value ?? []
    ;(result.run as any)(
      {
        ...oldPaginationParams,
        current: toCurrent,
        pageSize: toPageSize,
      },
      ...restParams,
    )
  }

  function changeCurrent(c: number) {
    onChange(c, pageSize.value)
  }

  function changePageSize(p: number) {
    onChange(current.value, p)
  }

  return {
    ...result,
    pagination: {
      current,
      pageSize,
      total,
      totalPage,
      onChange,
      changeCurrent,
      changePageSize,
    },
  } as PaginationResult<TData, TParams>
}
