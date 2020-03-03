import TemplateSelectModal from './components/TemplateSelectModal'

const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { PanelBody, PanelRow, Button, Modal, SelectControl } = wp.components;
const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { select, dispatch, withSelect} = wp.data;
const apiRequest = wp.apiRequest;


const {rawHandler} = wp.blocks;

const supportedPostTypes = derweiliBlockLayoutsSupportedPostTypes;

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
        isInitialPopupOpen: false, // stores if the initial popup (Select a Template) is open
        temporarilySelectdTemplate: null
    };

    /**
     * Load Available Layouts and open initial Pupup
     */
    componentDidMount(){

        const { isNewPost } = this.props;

        // load available block layouts
        apiRequest( { path: '/wp/v2/block-layout' } ).then( posts => {
            this.onNewPosts( posts );
        } );

        // check if is new post and open initial popup
        if(isNewPost){
            this.openInitialPopup();
        }

    }

    /**
     * Open the Initial "Choose a template" Popup
     */
    openInitialPopup(){

        const { postType } = this.props;
        // don't show popup when creating new templates
        if ( "block-layout" === postType ) return;

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
        console.log('on select template', template)

        if(template === null) {
            this.setState({isInitialPopupOpen: false})
            return
        }

        const { isNewPost } = this.props;

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
        const { blockInEditor } = this.props;
        const templateBlocksContent = JSON.stringify(blockInEditor);
        this.setState({templateBlocksContent});
    }
    
    /**
     * Compare current post content with post content in state
     */
    isUnchangedTemplate(){
        const { blockInEditor } = this.props;
        const templateBlocksContent = JSON.stringify(blockInEditor);
        
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

        const { templates, isOpen, isInitialPopupOpen, temporarilySelectdTemplate } = this.state;
        const { postType } = this.props;
        
        if( ! supportedPostTypes.includes(postType) ) return null;
        console.log(templates)
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
                        <TemplateSelectModal 
                            templates={templates}
                            onSelectTemplate={(template) => {this.onSelectTemplate(template) }}
                            onCloseModal={() => this.setState({isInitialPopupOpen: false})}
                            />
                    )
                }
            </Fragment>
        )
    }
}

const BlockLayoutsSidebarWithSelect = withSelect( ( select, ownProps ) => {
    const { isCleanNewPost, getCurrentPostType, getBlocks } = select("core/editor");
 
    return {
        isNewPost: isCleanNewPost(),
        postType: getCurrentPostType(),
        blockInEditor: getBlocks()
    };
} )( BlockLayoutsSidebar );

registerPlugin( "contenttemplates-sidebar", {
    icon: "layout",
    render: BlockLayoutsSidebarWithSelect
})