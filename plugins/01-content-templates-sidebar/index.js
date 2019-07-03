const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { PanelBody, PanelRow, Button, Modal } = wp.components;
const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { select, dispatch} = wp.data;
const apiRequest = wp.apiRequest;


const {rawHandler} = wp.blocks;



import "./plugin.scss";

/**
 * Block Layout Content
 * 
 * Render Sidebar, Popup and Notices
 */
class BlockLayoutsSidebar extends React.Component {

    state = {
        templates : [], // available templates
        selectedTemplate: null, // currently selected template
        isOpen: false, // is modal open
        templateBlocksContent: '', // save content after Template Select here to check if content was not changed
        isInitialPopupOpen: false // stores if the initial popup (Select a Template) is open
    };

    /**
     * Load Available Layouts and open initial Pupup
     */
    componentDidMount(){

        // get current post type
        const currentPostType = select('core/editor').getCurrentPostType();

        // get block layouts from api for current post type
        const path = '/wp/v2/block-layout?post_type=' + currentPostType;
        apiRequest( { path  } ).then( posts => {
            console.log('posts', posts);
            this.onNewPosts( posts );
        } );

        if( "block-layout" !==  currentPostType){ // don't show initial popup on new block layout screen
            // check if is new post and open initial popup
            const isNewPost = select("core/editor").isCleanNewPost();
            if(isNewPost){
                this.openInitialPopup();
            }
        }

    }

    /**
     * Open the Initial "Choose a template" Popup
     */
    openInitialPopup(){

        // don't show popup when creating new templates
        this.setState({isInitialPopupOpen: true});
    }

    /**
     * Receive Layouts from REST API
     * 
     * @param {array} posts Content Template Posts (REST)
     */
    onNewPosts( posts ){

        const templates = posts.map( post => {

            return {
                id: post.id,
                title: post.title.rendered,
                content: post.plain_content,
                icon: post.icon
            }

        })

        this.setState( {templates } );

    }


    /**
     * Overwrite Blocks on Template Select
     * 
     * @param {*} template Selected Template
     * @param {*} force Skip user consent modal
     */
    onSelectTemplate( template, force = false){

        const isNewPost = select("core/editor").isCleanNewPost();

        // show warning if is not new post, not forces and not unchanged template
        if ( force || isNewPost || this.isUnchangedTemplate() ){

            // get an array of gutenberg blocks from raw HTML (parse blocks)
            var gutblock = rawHandler({ 
                HTML:  template.content,
            });

            // delete all Blocks
            dispatch("core/editor").resetBlocks([]);

            // insert new Blocks
            dispatch("core/editor").insertBlocks(gutblock, 0);

            // close Modal and reset selected Template
            this.setState({isOpen:false, selectedTemplate: null})
            this.createTemplateSelectedNotice( template );

            // save current post content so we can check later if we have an unchanged template
            this.saveInsertedTemplate();

        }else{
            this.setState({
                isOpen: true,
                selectedTemplate: template
            });
        }
    }

    /**
     * Saves current post content in state
     */
    saveInsertedTemplate(){
        const blocks = select("core/editor").getBlocks();
        const templateBlocksContent = JSON.stringify(blocks);
        this.setState({templateBlocksContent});
    }
    
    /**
     * Compare current post content with post content in state
     */
    isUnchangedTemplate(){
        const blocks = select("core/editor").getBlocks();
        const templateBlocksContent = JSON.stringify(blocks);
        
        return templateBlocksContent === this.state.templateBlocksContent;
        
    }

    /**
     * Dispatch new "Tempalte selected" Notice
     * 
     * @param {object} template 
     */
    createTemplateSelectedNotice( template ){
        dispatch( 'core/notices' ).createNotice(
            'info',
            template.title + ' ' + __('Template selected', 'block-layouts'),
            {
                isDismissible: true,
                type: 'snackbar',
            }
        )
    }

    /**
     * Close the user consent modal
     */
    closeModal(){
        this.setState({isOpen:false, selectedTemplate: null})
    }

    /**
     * Render "No Layouts Found" Message
     * 
     * The templatesAdminLink comes from wp_localize_script
     * 
     */
    noLayoutsFound(){
        return (
            <Fragment>
                <h2>{__("No Layouts Found", "block-layouts")}</h2>
                <p>{__("You don't have any Layouts", "block-layouts")}</p>
                <a href={templatesAdminLink}>{__("Please create a new Template first.", "block-layouts")}</a>
            </Fragment>
        );
    }

    /**
     * Render view
     */
    render(){

        const { templates, isOpen, isInitialPopupOpen } = this.state;

        return (
            <Fragment>
                <PluginSidebarMoreMenuItem target="block-layouts-sidebar">
                    {__("Block Layouts", "block-layouts")}
                </PluginSidebarMoreMenuItem>
                <PluginSidebar
                    name="block-layouts-sidebar"
                    title={__("Block Layouts", "block-layouts")}
                >
                    <PanelBody title={__("Select a Template", "block-layouts")} opened>
                        <PanelRow>
                            <ul className="block-layout-button-list">
                                {
                                    templates.length > 0 ?
                                        templates.map(template => {
                                            return (
                                                <li key={template.id}>
                                                    <Button isDefault onClick={ () => { this.onSelectTemplate(template) } } className="template-button">
                                                        <img src={template.icon}  width="40"/>
                                                        {template.title}
                                                    </Button>
                                                </li>           
                                            );
                                        }) : this.noLayoutsFound()
                                    
                                }
                            </ul>
                        </PanelRow>
                        </PanelBody>
                </PluginSidebar>
                {
                    isOpen && (
                        <Modal
                            title={ __("Overwrite Content", "block-layouts") }
                            onRequestClose={ () => this.closeModal() }>
                            <p>
                                { __("Do you want to overwrite all existing content?", "block-layouts") }
                            </p>
                            <Button isPrimary onClick={ () => { this.onSelectTemplate( this.state.selectedTemplate, true ) } } >
                                { __("Overwrite Content", "block-layouts") }
                            </Button>
                        </Modal>
                    )
                }
                {
                    isInitialPopupOpen && templates.length > 0 && (
                        <Modal
                            title="Choose a template"
                            onRequestClose={ () => this.setState({isInitialPopupOpen: false}) }>
                            <ul className="block-layout-button-list">
                                {
                                    templates.length > 0 ?
                                        templates.map(template => {
                                            return (
                                                <li key={template.id}>
                                                    <Button isDefault onClick={ () => { this.setState({isInitialPopupOpen: false}); this.onSelectTemplate(template) } } className="template-button">
                                                        <img src={template.icon}  width="40"/>
                                                        {template.title}
                                                    </Button>
                                                </li>           
                                            );
                                        }) : this.noLayoutsFound()
                                    
                                }
                            </ul>
                            <div style={{textAlign:'center', marginBottom:'10px'}}>
                                <span>
                                    { __("or", "block-layouts") }
                                </span>
                            </div>
                            <Button isDefault style={{width:'100%', textAlign:'center', display:'block'}}   onClick={ () => { this.setState({isInitialPopupOpen: false}); } }>
                                { __("Start with an empty page", "block-layouts") }
                            </Button>
                        </Modal>
                    )
                }
            </Fragment>
        )
    }
}

registerPlugin( "contenttemplates-sidebar", {
    icon: "layout",
    render: BlockLayoutsSidebar
})