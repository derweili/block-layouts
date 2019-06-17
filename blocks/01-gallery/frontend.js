const { render } = wp.element;
import Gallery from "react-photo-gallery";
import FrontendGallery from "./components/FrontendGallery";

const galleries = document.querySelectorAll(
    ".wp-block-jsforwpadvblocks-gallery"
);

console.log(galleries);

galleries.forEach(gallery => {
    const direction = gallery.dataset.direction;
    const isLightboxEnabled = gallery.dataset.islighboxenabled;
    const images = gallery.querySelectorAll("img");
    const photos = [];
    images.forEach(img => {
        console.log(img, img);
        photos.push({
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt,
            caption: img.title,
            original: img.dataset.original
        })
    })

    console.log("photos", photos);

    render ( <FrontendGallery photos={photos} direction={direction} isLightboxEnabled={isLightboxEnabled}/>, gallery);


})