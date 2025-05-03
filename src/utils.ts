'use client';
import { CID } from 'multiformats';
import { ReadonlyURLSearchParams } from 'next/navigation';
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

export const createQueryString = (
  searchParams: ReadonlyURLSearchParams,
  name: string,
  value: string
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(name, value);

  return '?' + params.toString();
};

export const isValidCID = (value: string): boolean => {
  try {
    CID.parse(value); // Attempt to parse the CID
    return true; // If parsing succeeds, it's a valid CID
  } catch (error) {
    console.log('Invalid CID:', error);
    return false; // If parsing fails, it's not a valid CID
  }
};

export const isValidIPFSGatewayLink = (value: string): boolean => {
  const ipfsRegex = /^https?:\/\/[^/]+\/ipfs\/([a-zA-Z0-9]+)$/;
  const match = value.match(ipfsRegex);

  if (match && match[1]) {
    return isValidCID(match[1]); // Validate the extracted CID
  }

  return false; // Not a valid IPFS gateway link
};

export const getImageFromNFT = async (src: string) => {
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    return `https://${src}.ipfs.w3s.link`;
  }

  const response = await fetch(src);
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }

  // Check the Content-Type header
  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    // Handle JSON response
    const metaData = await response.json();
    console.log('Metadata:', metaData);

    return metaData?.image_gateway;
  } else if (contentType.includes('image/')) {
    return src;
  }
  return '';
};
