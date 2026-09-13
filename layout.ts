export function getLayout(width: number, height: number, fontScale = 1) {
  const short = height < 500;
  const padding = width < 360 ? 12 : width < 600 ? 16 : 24;
  const frameWidth = Math.min(width, 960);
  const contentWidth = Math.max(0, frameWidth - padding * 2);
  const gap = 12;
  const minCardWidth = 144 * Math.max(1, fontScale);
  const columns = Math.max(1, Math.min(3, Math.floor((contentWidth + gap) / (minCardWidth + gap))));
  return {
    short, padding, frameWidth, contentWidth, gap, columns,
    cardWidth: Math.max(0, (contentWidth - gap * (columns - 1)) / columns),
    stackActions: contentWidth < 340 || fontScale > 1.3,
    textAreaHeight: Math.max(120, Math.min(360, height * 0.34)),
    drawerWidth: Math.min(width * 0.88, 360),
  };
}
