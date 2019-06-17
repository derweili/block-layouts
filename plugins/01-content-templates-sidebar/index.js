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

class ContentTemplatesSidebar extends React.Component {

    state = {
        templates : [], // available templates
        selectedTemplate: null, // currently selected template
        isOpen: false // is modal open
    };

    /**
     * Load Available Templates
     */
    componentDidMount(){

        apiRequest( { path: '/wp/v2/content-template' } ).then( posts => {
            console.log('posts', posts);
            this.onNewPosts( posts );
        } );

    }

    /**
     * Receive Templates from REST API
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

        console.log('new Posts', this.state.templates);
    }

    onReloadEditor(){
    }

    /**
     * Select Tempalte and Overwrite Content (Old Ajax Way)
     */
    onSelectTemplateAjax( template ){

        // Get Post ID of current post
        const currentPostId = select('core/editor').getCurrentPostId();
        const isNewPost = select('core/editor').isCleanNewPost();

        /**
         * Check if we are on an new Post and Display warning
         * 
         * The Content Templates currently work for saved posts only
         */
        if(isNewPost){
            wp.data.dispatch('core/notices').createNotice(
                'warning', // Can be one of: success, info, warning, error.
                __("Please save the post, before selecting a template", "content-templates"), // Text string to display.
                {
                    isDismissible: true, // Whether the user can dismiss the notice.
                    // Any actions the user can perform.
                    actions: [

                    ]
                }
            );

            return;
        }

        // do ajax call
        fetch(wp.ajax.settings.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'action=copy_from_template&template=' + template.id + '&post=' + currentPostId
        })
        .then(response => response.json())
        .then((response) => {

            /**
             * Reload on Success or show error as notice
             */
            if(response.success){
                location.reload();
                
            }else{
                wp.data.dispatch('core/notices').createNotice(
                    'error', // Can be one of: success, info, warning, error.
                    response.error, // Text string to display.
                    {
                        isDismissible: true, // Whether the user can dismiss the notice.
                        // Any actions the user can perform.
                        actions: [
                            // {
                            //     url: '#',
                            //     label: 'View post'
                            // }
                        ]
                    }
                );

            }        });
 

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
        if (force || isNewPost){

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

        }else{
            this.setState({
                isOpen: true,
                selectedTemplate: template
            });
        }
    }

    /**
     * Close the user consent modal
     */
    closeModal(){
        this.setState({isOpen:false, selectedTemplate: null})
    }

    render(){

        const { templates, isOpen } = this.state;

        return (
            <Fragment>
                <PluginSidebarMoreMenuItem target="content-templates-sidebar">
                    {__("Content Templates", "jsforwpadvblocks")}
                </PluginSidebarMoreMenuItem>
                <PluginSidebar
                    name="content-templates-sidebar"
                    title={__("Content Templates", "jsforwpadvblocks")}
                >
                    <PanelBody title={__("Select a Template", "jsforwpadvblocks")} opened>
                        <PanelRow>
                            <ul className="content-template-button-list">
                                {
                                    templates.map(template => {
                                        return (
                                            <li key={template.id}>
                                                <Button isDefault onClick={ () => { this.onSelectTemplate(template) } } className="template-button">
                                                    <img src={template.icon}  width="40"/>
                                                    {template.title}
                                                </Button>
                                            </li>           
                                        );
                                    })
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
    render: ContentTemplatesSidebar
})