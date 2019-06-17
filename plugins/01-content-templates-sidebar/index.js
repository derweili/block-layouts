const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { PanelBody, PanelRow, Button } = wp.components;
const { registerPlugin } = wp.plugins;
const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { parse } = wp.blockSerializationDefaultParser;
const { select, dispatch} = wp.data;
const apiRequest = wp.apiRequest;
const ajax= wp.ajax;

const {createBlock} = wp.blocks;

// 

class PluginSidebarDemo extends React.Component {
// const PluginSidebarDemo = props => {

    state = {
        templates : []
    };

    componentDidMount(){

        apiRequest( { path: '/wp/v2/content-template' } ).then( posts => {
            console.log('posts', posts);
            this.onNewPosts( posts );
        } );

    }

    onNewPosts( posts ){

        const templates = posts.map( post => {

            return {
                id: post.id,
                title: post.title.rendered,
                content: post.plain_content
            }

        })

        this.setState( {templates } );

        console.log('new Posts', this.state.templates);
    }

    onReloadEditor(){
    }

    onSelectTemplate( template ){

        const currentPostId = select('core/editor').getCurrentPostId();

        fetch(wp.ajax.settings.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'action=copy_from_template&template=' + template.id + '&post=' + currentPostId
        })
        .then(response => response.json())
        .then((response) => {
            console.log(response);
            if(response.success){
                location.reload();
            }else{
                alert(response.error)
            }
            // msg = res.json().msg;
        });
 

    }

    render(){

        const { templates } = this.state;

        return (
            <Fragment>
                <PluginSidebarMoreMenuItem target="jsforwpadvgb-demo">
                    {__("Content Templates", "jsforwpadvblocks")}
                </PluginSidebarMoreMenuItem>
                <PluginSidebar
                    name="jsforwpadvgb-demo"
                    title={__("Content Templates", "jsforwpadvblocks")}
                >
                    <PanelBody title={__("Content Templates", "jsforwpadvblocks")} opened>
                    <PanelRow>
                        <ul>
                            {
                                templates.map(template => {
                                    return (
                                        <li key={template.id}>
                                            <Button isDefault onClick={ () => { this.onSelectTemplate(template) } }>
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
            </Fragment>
        )
    }
}

registerPlugin( "contenttemplates-sidebar", {
    icon: "layout",
    render: PluginSidebarDemo
})