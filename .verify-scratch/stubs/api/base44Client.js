
export const base44 = {
  functions: {
    invoke: async (name, payload) => {
      const hook = globalThis.__testLlmHook;
      if (typeof hook === 'function') {
        return { data: await hook(name, payload) };
      }
      return { data: { dialogue: '', actions: [] } };
    },
  },
};
  