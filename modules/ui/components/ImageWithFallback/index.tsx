import React from 'react';

type Props = {
  alt: string;
  fallbackSrc: string;
  handleError?: () => void;
  src: string;
} & React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

const ImageWithFallback: React.FC<Props> = ({
  alt,
  fallbackSrc,
  handleError,
  src,
  ...rest
}) => {
  const process_img = (src) => {
    set_imgSrcOrig(src);
    set_imgSrcWebp(src.replace(/\.jpg$/, '.webp'));
  };

  const [imgSrcWebp, set_imgSrcWebp] = React.useState<string>('');
  const [imgSrcOrig, set_imgSrcOrig] = React.useState<string>('');

  const onError = (err) => {
    // eslint-disable-next-line no-console
    console.warn('onError', { imgSrcOrig, src, fallbackSrc, err });
    if (imgSrcOrig !== fallbackSrc) {
      process_img(fallbackSrc);
      if (handleError) {
        handleError();
      }
    }
  };

  React.useEffect(() => {
    if (imgSrcOrig !== src) {
      process_img(src);
    }
  }, [src]);

  return (
    <picture>
      <source media="(min-width:336px)" srcSet={imgSrcWebp} type="image/webp" />
      <source media="(min-width:336px)" srcSet={imgSrcOrig} />
      <img alt={alt} onError={onError} src={src} {...rest} />
    </picture>
  );
};

export default ImageWithFallback;
