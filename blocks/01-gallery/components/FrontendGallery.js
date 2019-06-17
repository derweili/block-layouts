import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
const { Component } = wp.element;


export default class FrontendGallery extends React.Component {

    state = {
        currentImage: 0,
        viewerIsOpen: 0,
    } 
    // const [currentImage, setCurrentImage] = useState(0);
    // const [viewerIsOpen, setViewerIsOpen] = useState(false);

    openLightbox = (event, obj) => {
        if( this.props.isLightboxEnabled == "true" ){
            this.setState({
                viewerIsOpen: true,
                currentImage: obj.index
            })
        }
    };

    closeLightbox = () => {
        this.setState({
            viewerIsOpen: false
        })
    };

    render = () => {

        const { viewerIsOpen, currentImage } = this.state;
        const { photos, direction, isLightboxEnabled } = this.props;

        console.log(isLightboxEnabled);
        
        return (
            <div>
                <Gallery photos={photos} direction={direction} onClick={this.openLightbox} />
                <ModalGateway>
                    {viewerIsOpen ? (
                    <Modal onClose={this.closeLightbox}>
                        <Carousel
                        currentIndex={currentImage}
                        views={photos.map(x => ({
                            ...x,
                            src: x.original,
                            srcset: x.srcSet,
                            caption: x.title
                        }))}
                        />
                    </Modal>
                    ) : null}
                </ModalGateway>
            </div>
        );
    }
}
// render(<App />, document.getElementById("app"));