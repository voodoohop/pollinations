export const Image = ({ src, style }) => {
  if (src.endsWith(".mp4")) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        style={{...imgStyle, ...style}} />
    );
  }
  return (<img src={src} style={{...imgStyle, ...style}} />);
};

const imgStyle = {
  width: "80%",
  maxWidth: '512px',
  maxHeight: '512px',
  margin: 'auto',
  padding: '10px',
};
