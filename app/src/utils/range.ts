export const range = (start: number, end?: number, step = 1) => {
  let output = [];
  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    // @ts-expect-error This is fine
    output.push(i);
  }
  return output;
};
