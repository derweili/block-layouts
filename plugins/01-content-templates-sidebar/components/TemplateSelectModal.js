const { Button, Modal, SelectControl } = wp.components;
const { useState } = wp.element;
const { __ } = wp.i18n;

const TemplateSelectModal = ({ templates, onSelectTemplate, onCloseModal }) => {

    const [selectedTemplate, setSelectedTemplate] = useState(null)

    const switchTemplate = ( id ) => {
        console.log('switch template', id, templates)
        for (let i = 0; i < templates.length; i++) {
            if(templates[i].id === id) {
                setSelectedTemplate(templates[i])
                console.log('switch', templates[i]);
                
                return;
            }
        }
    }

    return (
        <Modal
            title="Choose a template"
            onRequestClose={ () => { onCloseModal && onCloseModal() } }>
            <SelectControl
                label="Select a Template"
                value={ selectedTemplate ? selectedTemplate.id : null }
                options={ [
                    { label: 'Select', value: null },
                    ...templates.map(template => ({
                        label: template.title,
                        value: template.id
                    }))
                ]}
                onChange={ ( id ) => { switchTemplate( parseInt( id )) } }
            />

            {
                selectedTemplate !== null && selectedTemplate.icon && <img src={selectedTemplate.icon} alt=""/>
            }

            <Button isDefault style={{width:'100%', textAlign:'center', display:'block'}}   onClick={ () => { onSelectTemplate(selectedTemplate) } }>
                {
                    selectedTemplate == null ? 'Start with an empty page' : 'Start with selected Template'
                }
            </Button>
        </Modal>
    )
}
export default TemplateSelectModal

