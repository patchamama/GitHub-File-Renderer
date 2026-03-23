import { useSettingsStore } from '../../../shared/store/settingsStore'
import type { DarkMode, FontSize, FontFamily, ReadingWidth, InlineCodeFont } from '../../../shared/store/settingsStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labels?: Record<T, string>
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            value === opt
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {labels ? labels[opt] : opt}
        </button>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      {children}
    </div>
  )
}

const CODE_BG_PRESETS = [
  { label: 'Slate',   light: '#e8eaed', dark: '#1e293b' },
  { label: 'Rose',    light: '#fce7f3', dark: '#4c0519' },
  { label: 'Amber',   light: '#fef3c7', dark: '#451a03' },
  { label: 'Green',   light: '#dcfce7', dark: '#052e16' },
  { label: 'Violet',  light: '#ede9fe', dark: '#2e1065' },
]

export function SettingsPanel({ isOpen, onClose }: Props) {
  const {
    darkMode, setDarkMode,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    readingWidth, setReadingWidth,
    inlineCodeBg, setInlineCodeBg,
    inlineCodeFont, setInlineCodeFont,
  } = useSettingsStore()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Display settings"
        className={`fixed right-0 top-0 h-full w-80 z-50 flex flex-col
          bg-white dark:bg-gray-900
          border-l border-gray-200 dark:border-gray-800
          shadow-xl transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Display settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

          {/* Dark mode */}
          <Section title="Appearance">
            <ButtonGroup<DarkMode>
              options={['light', 'system', 'dark']}
              value={darkMode}
              onChange={setDarkMode}
              labels={{ light: '☀ Light', system: '⊙ System', dark: '☾ Dark' }}
            />
          </Section>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Reading width */}
          <Section title="Reading width">
            <ButtonGroup<ReadingWidth>
              options={['narrow', 'medium', 'wide', 'full']}
              value={readingWidth}
              onChange={setReadingWidth}
              labels={{ narrow: 'Narrow', medium: 'Medium', wide: 'Wide', full: 'Full' }}
            />
          </Section>

          {/* Font size */}
          <Section title="Font size">
            <ButtonGroup<FontSize>
              options={['sm', 'base', 'lg', 'xl']}
              value={fontSize}
              onChange={setFontSize}
              labels={{ sm: 'Small', base: 'Base', lg: 'Large', xl: 'X-Large' }}
            />
          </Section>

          {/* Font family */}
          <Section title="Content font">
            <ButtonGroup<FontFamily>
              options={['sans', 'serif', 'mono']}
              value={fontFamily}
              onChange={setFontFamily}
              labels={{ sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' }}
            />
          </Section>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Inline code background */}
          <Section title="Inline code background">
            <div className="flex items-center gap-2 flex-wrap">
              {CODE_BG_PRESETS.map((p) => (
                <button
                  key={p.label}
                  title={p.label}
                  onClick={() => setInlineCodeBg(p.light)}
                  className="w-6 h-6 rounded border-2 transition-all"
                  style={{
                    backgroundColor: p.light,
                    borderColor: inlineCodeBg === p.light ? '#2563eb' : 'transparent',
                  }}
                />
              ))}
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="color"
                  value={inlineCodeBg}
                  onChange={(e) => setInlineCodeBg(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-300 dark:border-gray-600 bg-transparent p-0"
                />
                Custom
              </label>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Preview: <code style={{ backgroundColor: inlineCodeBg }} className="inline-code-preview px-1.5 py-0.5 rounded text-xs">example</code>
            </p>
          </Section>

          {/* Inline code font */}
          <Section title="Inline code font">
            <ButtonGroup<InlineCodeFont>
              options={['system', 'jetbrains', 'fira', 'cascadia']}
              value={inlineCodeFont}
              onChange={setInlineCodeFont}
              labels={{ system: 'System', jetbrains: 'JetBrains', fira: 'Fira Code', cascadia: 'Cascadia' }}
            />
          </Section>

        </div>
      </aside>
    </>
  )
}
