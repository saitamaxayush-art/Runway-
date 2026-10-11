# Accessibility

- Skip link, landmarks (header, nav, main, footer) and a title per route.
- Every input has a visible label or an aria-label; charts expose role img with a label.
- Active navigation uses aria-current; alerts use role status.
- The story chapter control is a keyboard operable slider (arrow keys).
- Focus rings use :focus-visible with a 3px Brass Deep (#8C5A12) outline; touch targets are at least 44px.
- Theme colours meet WCAG AA/AAA contrast guidelines: Emerald Ink (#064E3B) text on Champagne (#F8E7C9) background achieves >7:1 contrast; Brass Deep (#8C5A12) links and button fills meet 4.5:1; chart labels maintain 4.5:1 or better, and all text opacities remain at 0.72 or higher.
- Landing story video asset (`/runway-scrub.mp4`) is marked `aria-hidden="true"`, never autoplays, and is driven exclusively by scroll progress, with chapter text displayed on solid Champagne cards for complete readability over the video.
- When `prefers-reduced-motion` is active (or if the video asset fails to load), scroll-scrubbing is disabled in favor of an accessible fallback showing the poster image (`/runway-poster.jpg`) and stacking the six chapters with an immediate Enter Runway button.
- Route wipe transitions are skipped automatically under reduced motion settings.
