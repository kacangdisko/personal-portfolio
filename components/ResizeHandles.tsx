/**
 * Eight invisible grab zones around a window's inner edge — the same set
 * macOS gives you. Desktop only; hidden under the mobile breakpoint, where
 * windows are full-screen sheets.
 */
export default function ResizeHandles() {
  return (
    <>
      <div className="rz rz-n" data-resize="n" />
      <div className="rz rz-s" data-resize="s" />
      <div className="rz rz-e" data-resize="e" />
      <div className="rz rz-w" data-resize="w" />
      <div className="rz rz-ne" data-resize="ne" />
      <div className="rz rz-nw" data-resize="nw" />
      <div className="rz rz-se" data-resize="se" />
      <div className="rz rz-sw" data-resize="sw" />
    </>
  );
}
