/*
 * Copyright 2024 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IBufferCell } from '@xterm/xterm'

/**
 * Color mode constants from xterm
 */
const enum ColorMode {
  DEFAULT = 0,
  PALETTE = 1,
  RGB = 2
}

/**
 * ANSI color palette (standard 16 colors)
 */
const colorPalette = [
  '#000000', '#cd0000', '#00cd00', '#cdcd00', '#0000ee', '#cd00cd', '#00cdcd', '#e5e5e5',
  '#7f7f7f', '#ff0000', '#00ff00', '#ffff00', '#5c5cff', '#ff00ff', '#00ffff', '#ffffff'
]

/**
 * Convert RGB color values to hex format
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Get color from xterm color mode
 */
function getColor(colorMode: number, color: number): string {
  if (colorMode === ColorMode.DEFAULT) {
    return ''
  } else if (colorMode === ColorMode.PALETTE) {
    if (color < 16) {
      return colorPalette[color]
    } else if (color < 232) {
      // 216 color cube
      const c = color - 16
      const r = Math.floor(c / 36)
      const g = Math.floor((c % 36) / 6)
      const b = c % 6
      return rgbToHex(
        r ? r * 40 + 55 : 0,
        g ? g * 40 + 55 : 0,
        b ? b * 40 + 55 : 0
      )
    } else {
      // Grayscale
      const gray = (color - 232) * 10 + 8
      return rgbToHex(gray, gray, gray)
    }
  } else if (colorMode === ColorMode.RGB) {
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF
    return rgbToHex(r, g, b)
  }
  return ''
}

/**
 * Prepare an xterm IBufferCell for DOM rendering
 * This replaces the deprecated @kui-shell/xterm-helpers package
 */
export function prepareCellForDomRenderer(cell: IBufferCell): {
  classList: string
  style: string
  textContent: string
} {
  const classList: string[] = []
  const styles: string[] = []

  // Handle text attributes
  if (cell.isBold()) {
    classList.push('xterm-bold')
  }

  if (cell.isItalic()) {
    classList.push('xterm-italic')
  }

  if (cell.isDim()) {
    classList.push('xterm-dim')
  }

  if (cell.isUnderline()) {
    classList.push('xterm-underline')
  }

  if (cell.isStrikethrough()) {
    classList.push('xterm-strikethrough')
  }

  if (cell.isBlink()) {
    classList.push('xterm-blink')
  }

  if (cell.isInvisible()) {
    classList.push('xterm-invisible')
  }

  // Handle foreground color
  const fgColor = getColor(cell.getFgColorMode(), cell.getFgColor())
  if (fgColor) {
    styles.push(`color: ${fgColor}`)
  }

  // Handle background color
  const bgColor = getColor(cell.getBgColorMode(), cell.getBgColor())
  if (bgColor) {
    styles.push(`background-color: ${bgColor}`)
  }

  return {
    classList: classList.join(' '),
    style: styles.join('; '),
    textContent: cell.getChars()
  }
}
