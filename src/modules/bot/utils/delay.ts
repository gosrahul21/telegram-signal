export const delay = async (timeoutMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeoutMs);
  });
};
