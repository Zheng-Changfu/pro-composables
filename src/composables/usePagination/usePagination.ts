import { useRequest } from '../useRequest'
import type { Data, PaginationOptions, PaginationResult, Params, Service } from './types'

function usePagination<
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
    defaultParams: [1, 2, 3],
    // defaultParams: [{ current: defaultCurrent, pageSize: defaultPageSize }] as Params,
    refreshDepsAction: () => {
      changeCurrent(1)
    },
    ...rest,
  })

  const { current = 1, pageSize = defaultPageSize } = result.params[0] || {}

  const total = result.data?.total || 0
  const totalPage = useMemo(() => Math.ceil(total / pageSize), [pageSize, total])

  function onChange(c: number, p: number) {
    let toCurrent = c <= 0 ? 1 : c
    const toPageSize = p <= 0 ? 1 : p
    const tempTotalPage = Math.ceil(total / toPageSize)
    if (toCurrent > tempTotalPage) {
      toCurrent = Math.max(1, tempTotalPage)
    }

    const [oldPaginationParams = {}, ...restParams] = result.params || []

    result.run(
      {
        ...oldPaginationParams,
        current: toCurrent,
        pageSize: toPageSize,
      },
      ...restParams,
    )
  }

  function changeCurrent(c: number) {
    onChange(c, pageSize)
  }

  function changePageSize(p: number) {
    onChange(current, p)
  }

  return {
    ...result,
    pagination: {
      current,
      pageSize,
      total,
      totalPage,
      onChange: useMemoizedFn(onChange),
      changeCurrent: useMemoizedFn(changeCurrent),
      changePageSize: useMemoizedFn(changePageSize),
    },
  } as PaginationResult<TData, TParams>
}

export default usePagination
