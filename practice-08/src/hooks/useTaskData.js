import { useEffect, useRef, useState } from 'react';

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({
    tasks: [],
    categories: [],
    meta: { total: 0 }
  });

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);

  const mountedRef = useRef(false);
  const mutationControllerRef = useRef(null);

  const {
    q,
    completed,
    priority,
    categoryId
  } = filters;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (mutationControllerRef.current) {
        mutationControllerRef.current.abort();
        mutationControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadData() {
      setStatus('loading');
      setError(null);

      try {
        const nextSnapshot = await api.loadInitialData(
          {
            q,
            completed,
            priority,
            categoryId
          },
          {
            signal: controller.signal
          }
        );

        if (!active || controller.signal.aborted) {
          return;
        }

        setSnapshot(nextSnapshot);
        setStatus('ready');
        setError(null);
      } catch (loadError) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setError(loadError);
        setStatus('error');
      }
    }

    void loadData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    api,
    q,
    completed,
    priority,
    categoryId,
    revision
  ]);

  function refresh() {
    setRevision(previous => previous + 1);
  }

  async function mutate(operation) {
    if (!mountedRef.current) {
      return false;
    }

    if (mutationControllerRef.current) {
      return false;
    }

    const controller = new AbortController();
    mutationControllerRef.current = controller;

    setPending(true);
    setMutationError(null);

    try {
      await operation(controller.signal);

      if (
        !mountedRef.current ||
        controller.signal.aborted
      ) {
        return false;
      }

      setRevision(previous => previous + 1);

      return true;
    } catch (mutationFailure) {
      if (
        !mountedRef.current ||
        controller.signal.aborted
      ) {
        return false;
      }

      setMutationError(mutationFailure);

      return false;
    } finally {
      if (mutationControllerRef.current === controller) {
        mutationControllerRef.current = null;

        if (mountedRef.current) {
          setPending(false);
        }
      }
    }
  }

  function saveTask(id, value) {
    if (id === null) {
      return mutate(signal =>
        api.createTask(value, { signal })
      );
    }

    return mutate(signal =>
      api.updateTask(id, value, { signal })
    );
  }

  function toggleTask(task) {
    return mutate(signal =>
      api.setTaskCompleted(
        task.id,
        !task.completed,
        { signal }
      )
    );
  }

  function deleteTask(id) {
    return mutate(signal =>
      api.deleteTask(id, { signal })
    );
  }

  function resetData() {
    return mutate(signal =>
      api.resetDemoData({ signal })
    );
  }

  return {
    snapshot,
    status,
    error,
    mutationError,
    pending,
    refresh,
    saveTask,
    toggleTask,
    deleteTask,
    resetData
  };
}