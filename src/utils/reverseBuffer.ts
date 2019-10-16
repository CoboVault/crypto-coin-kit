export default (buf: Buffer) => {
  const buf2 = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    buf2[i] = buf[buf.length - 1 - i];
  }
  return buf2;
};
