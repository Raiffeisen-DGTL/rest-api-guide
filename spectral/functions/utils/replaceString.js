export const replaceInString = (str, find, repl) => {
  // modified from http://jsperf.com/javascript-replace-all/10
  const orig = str.toString();
  let res = '';
  let rem = orig;
  let beg = 0;
  let end = rem.indexOf(find);

  while (end > -1) {
    res += orig.substring(beg, beg + end) + repl;
    rem = rem.substring(end + find.length, rem.length);
    beg += end + find.length;
    end = rem.indexOf(find);
  }

  if (rem.length > 0) {
    res += orig.substring(orig.length - rem.length, orig.length);
  }

  return res;
};