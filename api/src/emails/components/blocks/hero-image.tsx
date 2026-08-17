import { Img } from '@react-email/components';
import { color, SITE_URL } from '../../lib/tokens.js';
import { bgAttr } from '../../lib/html-attrs.js';

interface HeroImageProps {
  /** Filename inside /email, without extension. */
  name: string;
  /** Required. Images are blocked by default in some clients and the alt is
   *  all a screen reader gets, so it has to say what the picture shows. */
  alt: string;
  /** Intrinsic width of the source file, used to compute display height. */
  srcWidth: number;
  srcHeight: number;
}

/** Card content width — the image is full-bleed, so it spans the card interior. */
const DISPLAY_WIDTH = 598;

/**
 * Full-bleed image band at the top of the card.
 *
 * Height is computed from the source aspect rather than left to the client:
 * Outlook ignores `height:auto` on an image with an explicit width and will
 * stretch it to whatever it feels like otherwise.
 */
export function HeroImage({ name, alt, srcWidth, srcHeight }: HeroImageProps) {
  const height = Math.round((srcHeight / srcWidth) * DISPLAY_WIDTH);

  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td style={styles.cell} {...bgAttr(color.bg)}>
            <Img
              src={`${SITE_URL}/email/${name}.png`}
              width={String(DISPLAY_WIDTH)}
              height={String(height)}
              alt={alt}
              style={styles.img}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  cell: {
    fontSize: 0,
    lineHeight: 0,
    padding: 0,
  },
  img: {
    display: 'block' as const,
    // Scales down on narrow screens instead of forcing a horizontal scroll
    maxWidth: '100%',
    width: '100%',
    height: 'auto',
  },
} as const;
