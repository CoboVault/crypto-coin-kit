export default (bytes: Buffer): string => {
  return bytes.reduce((acc, cur) => {
    return acc + ("00" + cur.toString(16)).slice(-2);
  }, "");
};
