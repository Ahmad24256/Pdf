export function create(initializer) {
  let state;
  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  };
  const getState = () => state;
  const useStore = (selector) => (selector ? selector(state) : state);
  useStore.getState = getState;
  useStore.setState = setState;
  state = initializer(setState, getState);
  return useStore;
}
