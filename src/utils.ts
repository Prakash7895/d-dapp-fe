'use client';

import { GENDER, SEXUAL_ORIENTATION } from './apiSchemas';

export const capitalizeFirstLetter = (str: string = '') =>
  str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

export const isEmpty = (
  val:
    | string
    | number
    | boolean
    | null
    | undefined
    | unknown[]
    | Record<string, unknown>
): boolean => {
  if (val === null || val === undefined) return true;

  if (typeof val === 'string') return val.trim().length === 0;

  if (Array.isArray(val)) return val.length === 0;

  if (typeof val === 'object') return Object.keys(val).length === 0;

  if (typeof val === 'number') return false;

  if (typeof val === 'boolean') return false;

  return true;
};

export const capitalizeEveryFirstChar = (str: string) =>
  str
    .split(' ')
    .map((el) => capitalizeFirstLetter(el))
    .join(' ');

export const genderOptions = GENDER.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

export const sexualOrientationOptions = SEXUAL_ORIENTATION.map((e) => ({
  label: capitalizeFirstLetter(e),
  value: e,
}));

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const clonedObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return clonedObj as T;
};
