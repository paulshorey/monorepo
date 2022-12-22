let list = [];
let size = 10;
for (let i = 1; i <= 456; i++) {
  list.push(size);
  if (!(i % 45) && size > 1) size--;
}