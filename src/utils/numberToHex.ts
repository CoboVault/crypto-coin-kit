export default (num: number) => {
  const s = num.toString(16);
  return s.length % 2 === 1 ? "0" + s : s;
};
