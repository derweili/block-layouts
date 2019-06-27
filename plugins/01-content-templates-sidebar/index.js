const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { PanelBody, PanelRow, Button, Modal } = wp.components;
const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { parse } = wp.blockSerializationDefaultParser;
const { select, dispatch} = wp.data;
const apiRequest = wp.apiRequest;
const ajax= wp.ajax;


const {createBlock, rawHandler} = wp.blocks;



import "./plugin.scss";

/**
 * 
 */

class BlockLayoutsSidebar extends React.Component {

    state = {
        templates : [], // available templates
        selectedTemplate: null, // currently selected template
        isOpen: false, // is modal open
        templateBlocksContent: '', // save content after Template Select here to check if content was not changed
    };

    /**
     * Load Available Layouts
     */
    componentDidMount(){

        apiRequest( { path: '/wp/v2/block-layout' } ).then( posts => {
            this.onNewPosts( posts );
        } );

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

    onReloadEditor(){
    }

    /**
     * Overwrite Blocks on Template Select
     * 
     * @param {*} template Selected Template
     * @param {*} force Skip user consent modal
     */
    onSelectTemplate( template, force = false){
        // const newBlockTemplate = parse(template.content);
        // console.log('newBlockTemplate', newBlockTemplate);

        const isNewPost = select("core/editor").isCleanNewPost();

        // show warning if 
        if ( force || isNewPost || this.isUnchangedTemplate() ){

            // get an array of gutenberg blocks from raw HTML (parse blocks)
            var gutblock = wp.blocks.rawHandler({ 
                HTML:  template.content,
            });

            // re-serialize blocks
            // var serelized = wp.blocks.serialize(gutblock);
            // serelized = serelized;

            // delete all Blocks
            dispatch("core/editor").resetBlocks([]);

            // insert new Blocks
            dispatch("core/editor").insertBlocks(gutblock, 0);

            // close Modal and reset selected Template
            this.setState({isOpen:false, selectedTemplate: null})
            this.createTemplateSelectedNotice( template );

            this.saveInsertedTemplate();




        }else{
            this.setState({
                isOpen: true,
                selectedTemplate: template
            });
        }
    }

    saveInsertedTemplate(){
        const blocks = select("core/editor").getBlocks();
        const templateBlocksContent = JSON.stringify(blocks);
        this.setState({templateBlocksContent});
    }
    
    isUnchangedTemplate(){
        const blocks = select("core/editor").getBlocks();
        const templateBlocksContent = JSON.stringify(blocks);
        
        return templateBlocksContent === this.state.templateBlocksContent;
        
    }

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

    render(){

        const { templates, isOpen } = this.state;

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
                            title="Overwrite Content"
                            onRequestClose={ () => this.closeModal() }>
                            <p>
                                Do you want to overwrite all Existing Content?
                            </p>
                            <Button isPrimary onClick={ () => { this.onSelectTemplate( this.state.selectedTemplate, true ) } } >
                                Overwrite Content
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