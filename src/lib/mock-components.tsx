import React from "react";

const pdfStyleToCSS = (style: Record<string, unknown> = {}): React.CSSProperties => {
  const css: Record<string, unknown> = {};
  const map: Record<string, string> = {
    marginBottom: "marginBottom",
    marginTop: "marginTop",
    marginLeft: "marginLeft",
    marginRight: "marginRight",
    padding: "padding",
    paddingTop: "paddingTop",
    paddingBottom: "paddingBottom",
    paddingLeft: "paddingLeft",
    paddingRight: "paddingRight",
    fontSize: "fontSize",
    fontFamily: "fontFamily",
    fontWeight: "fontWeight",
    fontStyle: "fontStyle",
    textAlign: "textAlign",
    color: "color",
    backgroundColor: "backgroundColor",
    flexDirection: "flexDirection",
    justifyContent: "justifyContent",
    alignItems: "alignItems",
    flex: "flex",
    flexWrap: "flexWrap",
    gap: "gap",
    borderRadius: "borderRadius",
    textTransform: "textTransform",
    textDecoration: "textDecoration",
    lineHeight: "lineHeight",
    letterSpacing: "letterSpacing",
    maxWidth: "maxWidth",
    minHeight: "minHeight",
    width: "width",
    height: "height",
    position: "position",
    top: "top",
    left: "left",
    right: "right",
    bottom: "bottom",
  };

  for (const [key, val] of Object.entries(style)) {
    if (map[key]) {
      const isNumericPx =
        typeof val === "number" && key !== "flex" && key !== "fontWeight";
      css[map[key]] = isNumericPx ? `${val}px` : val;
    } else if (key === "marginVertical") {
      css.marginTop = `${val}px`;
      css.marginBottom = `${val}px`;
    } else if (key === "marginHorizontal") {
      css.marginLeft = `${val}px`;
      css.marginRight = `${val}px`;
    } else if (key === "paddingVertical") {
      css.paddingTop = `${val}px`;
      css.paddingBottom = `${val}px`;
    } else if (key === "paddingHorizontal") {
      css.paddingLeft = `${val}px`;
      css.paddingRight = `${val}px`;
    } else if (key === "borderBottomWidth") {
      css.borderBottom = `${val}px solid ${style.borderBottomColor ?? "#000"}`;
    } else if (key === "borderTopWidth") {
      css.borderTop = `${val}px solid ${style.borderTopColor ?? "#000"}`;
    } else if (key === "borderWidth") {
      css.border = `${val}px solid ${style.borderColor ?? "#000"}`;
    }
  }
  return css as React.CSSProperties;
};

export function MockDocument({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function MockPage({
  children,
  style,
}: {
  children?: React.ReactNode;
  size?: string;
  style?: Record<string, unknown>;
}) {
  return (
    <div
      data-pdf-page=""
      style={{
        width: "595px",
        minHeight: "842px",
        background: "#fff",
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
        fontFamily: "Times New Roman, serif",
        fontSize: "12px",
        color: "#000",
        marginBottom: "24px",
        ...pdfStyleToCSS(style),
      }}
    >
      {children}
    </div>
  );
}

export function MockView({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: Record<string, unknown>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", ...pdfStyleToCSS(style) }}>
      {children}
    </div>
  );
}

export function MockText({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: Record<string, unknown>;
}) {
  return <div style={{ ...pdfStyleToCSS(style) }}>{children}</div>;
}

export function MockImage({ src, style }: { src?: string; style?: Record<string, unknown> }) {
  return src ? (
    <img src={src} style={{ maxWidth: "100%", ...pdfStyleToCSS(style) }} />
  ) : null;
}

export const MockStyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};
