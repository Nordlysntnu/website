// How wide each kind of photo is shown, so the browser can pick the small version (at most 800 px) when it is enough.
export const PHOTO_SIZES = {
    featured: '(max-width: 760px) 100vw, 760px',
    card: '(max-width: 640px) 100vw, 420px',
    cover: '(max-width: 1152px) 100vw, 1152px',
    normal: '(max-width: 672px) 100vw, 672px',
    wide: '(max-width: 1152px) 100vw, 1152px',
    full: '100vw',
    left: '(max-width: 672px) 100vw, 336px',
    right: '(max-width: 672px) 100vw, 336px',
    row: '(max-width: 640px) 50vw, 400px',
    gallery: '(max-width: 640px) 50vw, 300px',
};

// The small version (same shape, at most 800 px) and the focal point chosen in the CMS for cropped photos.
export function imageProps(photo, kind) {
    const props = { src: photo.url };
    if (photo.small && photo.width && photo.height) {
        const smallWidth = Math.round(photo.width * Math.min(1, 800 / Math.max(photo.width, photo.height)));
        props.srcSet = `${photo.small} ${smallWidth}w, ${photo.url} ${photo.width}w`;
        props.sizes = PHOTO_SIZES[kind] || PHOTO_SIZES.normal;
    }
    if (photo.focalX != null && photo.focalY != null) props.style = { objectPosition: `${photo.focalX}% ${photo.focalY}%` };
    return props;
}
