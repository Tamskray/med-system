export const mainBoxSx = {
  display: "flex",
  height: "100vh",
};

export const mainContainerSx = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

export const styledBubblesSx = {
  "&::before": {
    content: '""',
    position: "absolute",
    width: 240,
    height: 240,
    right: -90,
    bottom: -110,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 35% 35%, rgba(33, 150, 243, 0.22), rgba(33, 150, 243, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 180,
    height: 180,
    right: 70,
    bottom: -80,
    borderRadius: "50%",
    background: "radial-gradient(circle at 65% 65%, rgba(0, 150, 136, 0.18), rgba(0, 150, 136, 0))",
    pointerEvents: "none",
    zIndex: 0,
  },
};

export const styledBackgroundSx = (isSchedulePage) => ({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  position: "relative",
  isolation: "isolate",
  ...(isSchedulePage ? {} : styledBubblesSx),
});

export const pagePaddingSx = (isLogged) => ({
  position: "relative",
  zIndex: 1,
  height: "100%",
  overflow: "auto",
  ...(isLogged ? { paddingX: 3, paddingY: 3 } : {}),
});

export const sidebarContainerSx = (open) => ({
  width: open ? 220 : 80,
  flexShrink: 0,
  backgroundColor: "background.default",
  borderRight: "1px solid",
  borderColor: "divider",
  transition: "width 0.3s ease",
  overflowY: "auto",
});
