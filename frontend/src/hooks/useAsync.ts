import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

/**
 * 비동기 조회 공통 훅 (loading / error / success + 다시 불러오기).
 * initialData가 있으면 로딩 없이 바로 success로 시작한다.
 */
export function useAsync<T>(
  fetcher: (signal: AbortSignal, force: boolean) => Promise<T>,
  deps: DependencyList,
  initialData: T | null = null,
) {
  const [state, setState] = useState<AsyncState<T>>(
    initialData ? { status: "success", data: initialData } : { status: "loading" },
  );
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    const force = reloadKey > 0;
    setState((prev) => (prev.status === "success" && !force ? prev : { status: "loading" }));

    fetcherRef
      .current(controller.signal, force)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error: err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다."),
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { state, reload };
}
