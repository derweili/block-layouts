/**
 * Block dependencies 
 */

import icon from "./icon";
import "./style.scss";
import Gallery from "react-photo-gallery";

/**
 * Block libraries
 * 
 */

 const { __ } = wp.i18n;
 const { Fragment } = wp.element;
 const { registerBlockType } = wp.blocks;
 const { BlockControls, InspectorControls, MediaUpload, MediaPlaceholder } = wp.editor;
 const { IconButton, Toolbar, PanelBody, PanelRow, RadioControl, ToggleControl } = wp.components;
 const { dispatch, select } = wp.data;


 /**
  * Register Block
  */

export default registerBlockType("jsforwpadvblocks/gallery", {
    title: __("Gallery", "jsforadvblocks"),
    description: __("Demo custom Gallery block", "jsforadvblocks"),
    category: 'jsforwpadvblocks',
    icon,
    keywords: [
        __("Masonry", "jsforadvblocks"),
        __("Images Media", "jsforadvblocks"),
        __("Lightbox", "jsforadvblocks")
    ],
    supports: ["full", "wide"],
    attributes: {
        images: { 
            type: "array",
            default: []
        },
        direction: {
            type: "string",
            default: "column"
        },
        isLighboxEnabled: {
            type: "boolean",
            default: true
        }
    },
    edit: props => {

        const {
            attributes: {images, direction, isLighboxEnabled},
            className,
            setAttributes
        } = props;

        const onSelectImages = newImages => {
            console.log(newImages);
            const images = newImages.map(img => {
                return {
                    src: !! img.sizes.hasOwnProperty('medium') ? img.sizes.medium.url : img.sizes.full.url,
                    width: !! img.sizes.hasOwnProperty('medium') ? img.sizes.medium.width : img.sizes.full.width,
                    height: !! img.sizes.hasOwnProperty('medium') ? img.sizes.medium.height : img.sizes.full.height,
                    original: !! img.sizes.hasOwnProperty('large') ? img.sizes.large.url : img.sizes.full.url,
                    id: img.id,
                    alt: img.alt,
                    caption: img.caption,
                }
            })


            setAttributes({images})

        }

        /**
         * Toggle the Sidebar
         */
        const hideSidebar = () => {

            // check if the editor sidebar is open
            const isSidebarOpen = select("core/edit-post").isEditorSidebarOpened();
            if(isSidebarOpen){

                // close sidebar if open
                dispatch("core/edit-post").closeGeneralSidebar();

            }else{

                // open sidebar if closed
                dispatch("core/edit-post").openGeneralSidebar('edit-post/block');

            }

        }

        /**
         * Delete all Block from the Editor
         */
        const clearEditor = () => {

            // overwrite all blocks with emtpy array
            console.log( dispatch("core/editor").resetBlocks([]) );
            
        }

        return (
            <Fragment>
                <InspectorControls>
                    <PanelBody title={ __("Gallery Settings", "jsforadvblocks") } initialOpen={true}>
                        <PanelRow>
                            <RadioControl 
                                label={ __("Grid Style", "jsforadvblocks") }
                                selected={direction}
                                options={[
                                    {label: __("Rows", "jsforadvblocks"), value: "row"},
                                    {label: __("Columns", "jsforadvblocks"), value: "column"}
                                ]}
                                onChange={direction => setAttributes({direction})}
                                />
                        </PanelRow>
                        <PanelRow>
                            <ToggleControl 
                                label={ __("Enable Lightbox", "jsforadvblocks") }
                                help={ isLighboxEnabled ? __("Lightbox is enabled.", "jsforadvblocks") : __("Lightbox is disabled.", "jsforadvblocks") }
                                checked={isLighboxEnabled}
                                onChange={ () => setAttributes({isLighboxEnabled: !isLighboxEnabled}) }
                                />
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>
                {!!images.length && (
                    <BlockControls>
                        <Toolbar>
                            <MediaUpload  
                                allowedTypes={["images"]}
                                multiple
                                gallery
                                value={images.map(img => img.id)}
                                onSelect={onSelectImages}
                                render={({open}) => (
                                    <IconButton 
                                        className="components-toolbar__control"
                                        label={ __("Edit Gallery", "jsforadvblocks") }
                                        icon="edit"
                                        onClick={open}
                                    />
                                )}
                            />
                            <IconButton
                                className="components-toolbar__control"
                                label={ __("Toggle Sidebar", "jsforadvblocks") }
                                icon="leftright"
                                onClick={() => hideSidebar()}>
                            </IconButton>
                            <IconButton
                                className="components-toolbar__control"
                                label={ __("Clear Editor", "jsforadvblocks") }
                                icon="trash"
                                onClick={() => clearEditor()}>
                            </IconButton>
                        </Toolbar>
                    </BlockControls>
                )}

                <div className={`${className} ${direction}`}>
                    {
                        !!!images.length ? (
                            <MediaPlaceholder
                                labels={{
                                    title: __("Gallery", "jsforadvblocks"),
                                    instructions: __(
                                        "Drag images, upload new ones or select files from you library",
                                        "jsforadvblocks"
                                    )
                                }}
                                icon={icon}
                                accept="images/*"
                                multiple
                                onSelect={onSelectImages}
                                ></MediaPlaceholder>
                        ) : (
                            <Gallery
                                photos={images}
                                direction={direction}
                                ></Gallery>
                        )
                    }
                </div>
            </Fragment>
        )
    },
    save: props => {
        const { images, direction, isLighboxEnabled } = props.attributes;
        return (
            <div
                className={ `${direction} `}
                data-direction={direction}
                data-isLighboxEnabled={isLighboxEnabled}
            >
                {images.map(img => (
                    <img 
                        src={img.src}
                        alt={img.alt} 
                        title={img.caption} 
                        data-id={img.id} 
                        width={img.width} 
                        height={img.height} 
                        data-original={img.original} 
                        
                        />
                ))}
            </div>
        )
    }
})