/**
 * `bgcolor` as a JSX spread.
 *
 * React 19's types dropped the deprecated bgcolor attribute, but it's still
 * load-bearing in email: Outlook's Word engine ignores CSS background-color on
 * table cells and the body, and honours only the presentational attribute. The
 * cast is contained here so no template needs one.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bgAttr = (hex: string): any => ({ bgcolor: hex });
