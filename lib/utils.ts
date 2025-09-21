import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolvePathPreview({
  base,
  key,
  version,
  ext,
  template
}: {
  base: string
  key: string
  version: string
  ext: string
  template: string
}): string {
  if (!template) {
    return `${base}/${key}/v${version}/`
  }

  return template
    .replace(/{base}/g, base || 'base_path')
    .replace(/{key}/g, key || 'sub_asset_key')
    .replace(/{version}/g, version || '1')
    .replace(/{ext}/g, ext || 'ext')
}
