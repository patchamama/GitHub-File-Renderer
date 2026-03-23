import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DarkMode = 'light' | 'dark' | 'system'
export type FontSize = 'sm' | 'base' | 'lg' | 'xl'
export type FontFamily = 'sans' | 'serif' | 'mono'
export type ReadingWidth = 'narrow' | 'medium' | 'wide' | 'full'
export type InlineCodeFont = 'system' | 'jetbrains' | 'fira' | 'cascadia'

export interface SettingsState {
  darkMode: DarkMode
  fontSize: FontSize
  fontFamily: FontFamily
  readingWidth: ReadingWidth
  inlineCodeBg: string
  inlineCodeFont: InlineCodeFont
  setDarkMode: (v: DarkMode) => void
  setFontSize: (v: FontSize) => void
  setFontFamily: (v: FontFamily) => void
  setReadingWidth: (v: ReadingWidth) => void
  setInlineCodeBg: (v: string) => void
  setInlineCodeFont: (v: InlineCodeFont) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: 'system',
      fontSize: 'base',
      fontFamily: 'sans',
      readingWidth: 'medium',
      inlineCodeBg: '#e8eaed',
      inlineCodeFont: 'system',
      setDarkMode: (v) => set({ darkMode: v }),
      setFontSize: (v) => set({ fontSize: v }),
      setFontFamily: (v) => set({ fontFamily: v }),
      setReadingWidth: (v) => set({ readingWidth: v }),
      setInlineCodeBg: (v) => set({ inlineCodeBg: v }),
      setInlineCodeFont: (v) => set({ inlineCodeFont: v }),
    }),
    {
      name: 'github-renderer-settings',
      partialize: ({ darkMode, fontSize, fontFamily, readingWidth, inlineCodeBg, inlineCodeFont }) => ({
        darkMode, fontSize, fontFamily, readingWidth, inlineCodeBg, inlineCodeFont,
      }),
    },
  ),
)

export const fontSizeMap: Record<FontSize, string> = {
  sm: 'prose-sm',
  base: 'prose',
  lg: 'prose-lg',
  xl: 'prose-xl',
}

export const readingWidthMap: Record<ReadingWidth, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-none',
}

export const fontFamilyMap: Record<FontFamily, string> = {
  sans: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
}

export const inlineCodeFontMap: Record<InlineCodeFont, string> = {
  system: "ui-monospace, SFMono-Regular, Menlo, monospace",
  jetbrains: "'JetBrains Mono', ui-monospace, monospace",
  fira: "'Fira Code', ui-monospace, monospace",
  cascadia: "'Cascadia Code', ui-monospace, monospace",
}
