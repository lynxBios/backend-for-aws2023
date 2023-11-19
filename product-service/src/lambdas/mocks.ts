const products = new Array(100).fill(null).map((_, index) => ({
  id: String(index),
  title: `Some Stuff${index}`,
  description: `Awesome description for Some Stuff${index}`,
  price: (index + 1 ) * 10,
}));

export { products };