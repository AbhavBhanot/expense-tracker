/**
 * Chart theme helpers — single source of truth for chart colors.
 * Keeps all chart components consistent with the design system.
 */

export const CHART_THEME = {
  tooltipBg:     '#111113',
  tooltipBorder: '#27272a',
  tooltipTitle:  '#fafafa',
  tooltipBody:   '#a1a1aa',
  gridColor:     '#27272a',
  tickColor:     '#52525b',
  tickColorBold: '#a1a1aa',
  accent:        '#818cf8',
  accentMuted:   'rgba(129, 140, 248, 0.12)',
  accentDash:    '#3f3f46',
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
};

export function tooltipDefaults(extra = {}) {
  return {
    backgroundColor: CHART_THEME.tooltipBg,
    titleColor:      CHART_THEME.tooltipTitle,
    bodyColor:       CHART_THEME.tooltipBody,
    borderColor:     CHART_THEME.tooltipBorder,
    borderWidth:     1,
    cornerRadius:    6,
    padding:         12,
    titleFont: { family: CHART_THEME.fontFamily, weight: '600', size: 12 },
    bodyFont:  { family: CHART_THEME.fontFamily, size: 12 },
    ...extra,
  };
}

export function tickFont(size = 11) {
  return { family: CHART_THEME.fontFamily, size };
}
