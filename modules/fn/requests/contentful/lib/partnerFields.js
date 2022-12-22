import { pictureFromSrc } from 'src/functions/pictureFromSrc';

/**
 * Needs documentation
 */
export default function partnerFields(part) {
  if (part.logo) {
    let picture = pictureFromSrc({
      src: part.logo,
      height: 90,
    });
    // console.info('\n\nlogo', picture.src);
    part.logo = picture.src;
  }
  if (part.slideshowBackgroundImage) {
    let picture = pictureFromSrc({
      src: part.slideshowBackgroundImage,
      width: 1170 * 0.75,
      heightWidthRatio: 535 / 1170,
      crop: true,
    });
    // console.info('\nslideshowBackgroundImage', picture.src);
    part.slideshowBackgroundImage = picture.src;
  }

  return part;
}
