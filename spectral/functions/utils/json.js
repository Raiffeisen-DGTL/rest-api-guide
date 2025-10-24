import { replaceInString } from "./replaceString.js";

export const extractPointerFromRef = (ref) => {
  if (typeof ref !== 'string' || ref.length === 0) {
    return null;
  }

  const index = ref.indexOf('#');
  return index === -1 ? null : ref.slice(index);
};

export const decodeFragmentSegments = (segments) => {
  const len = segments.length;
  const res = [];
  let i = -1;

  while (++i < len) {
    res.push(decodePointer(segments[i]));
  }

  return res;
};

export const decodeUriFragmentIdentifier = (ptr) => {
  if (typeof ptr !== 'string') {
    throw new TypeError('Invalid type: JSON Pointers are represented as strings.');
  }

  if (ptr.length === 0 || ptr[0] !== '#') {
    throw new URIError('Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.');
  }

  if (ptr.length === 1) {
    return [];
  }

  if (ptr[1] !== '/') {
    throw new URIError('Invalid JSON Pointer syntax.');
  }

  return decodeFragmentSegments(ptr.substring(2).split('/'));
};

export const pointerToPath = (pointer) => {
  return decodeUriFragmentIdentifier(pointer);
};

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const PERCENT_ENCODING_OCTET = /%[0-9a-f]+/gi;

/**
 * Removes special json pointer characters in a value. Example:
 *
 * decodePointer('#/paths/~1users) => '#/paths//users'
 */
export const decodePointer = (value) => {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value.replace(PERCENT_ENCODING_OCTET, safeDecodeURIComponent);
  }

  return replaceInString(replaceInString(decoded, '~1', '/'), '~0', '~');
};

export function isPlainObject(maybeObj) {
  if (typeof maybeObj !== 'object' || maybeObj === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(maybeObj);
  return (
    proto === null ||
    proto === Object.prototype ||
    // this is to be more compatible with Lodash.isPlainObject that also checks the constructor
    (typeof maybeObj.constructor === 'function' &&
      Function.toString.call(Object) === Function.toString.call(maybeObj.constructor))
  );
}