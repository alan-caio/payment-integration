function uppercase(str) {
  const array1 = str.split(' ');
  const newarray1 = [];

  for (let x = 0; x < array1.length; x++) {
    newarray1.push(array1[x].charAt(0).toUpperCase() + array1[x].slice(1));
  }
  return newarray1.join(' ');
}

module.exports = uppercase;