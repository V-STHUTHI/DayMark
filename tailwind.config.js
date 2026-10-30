/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gh: {
          canvas: {
            default: 'var(--gh-bg-canvas)',
            subtle: 'var(--gh-bg-subtle)',
            inset: 'var(--gh-bg-inset)',
            header: 'var(--gh-bg-header)',
          },
          border: {
            default: 'var(--gh-border-default)',
            muted: 'var(--gh-border-muted)',
            active: 'var(--gh-border-active)',
          },
          fg: {
            default: 'var(--gh-fg-default)',
            muted: 'var(--gh-fg-muted)',
            subtle: 'var(--gh-fg-subtle)',
            onEmphasis: '#ffffff',
          },
          accent: {
            fg: 'var(--gh-accent-fg)',
            emphasis: 'var(--gh-accent-emphasis)',
            muted: 'var(--gh-accent-muted)',
            subtle: 'var(--gh-accent-subtle)',
          },
          success: {
            fg: 'var(--gh-success-fg)',
            emphasis: '#238636',
            hover: '#2ea043',
            muted: 'var(--gh-success-muted)',
            subtle: 'var(--gh-success-subtle)',
          },
          attention: {
            fg: 'var(--gh-attention-fg)',
            muted: 'var(--gh-attention-muted)',
            subtle: 'var(--gh-attention-subtle)',
          },
          danger: {
            fg: 'var(--gh-danger-fg)',
            muted: 'var(--gh-danger-muted)',
            subtle: 'var(--gh-danger-subtle)',
          },
          cell: {
            0: 'var(--gh-cell-0)',
            1: 'var(--gh-cell-1)',
            2: 'var(--gh-cell-2)',
            3: 'var(--gh-cell-3)',
            4: 'var(--gh-cell-4)',
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
