const { __ } = wp.i18n;

const { withSelect } = wp.data;


const WithSelectDemo = ({ blockCount }) => {
    return (
        <div>
            <pre>
                <code>
                    {"withSelect(() => {})(WithSelect)"}
                </code>
            </pre>
            <p>
                { __( "Block Count:", "jsforwpadvblocks" ) } {blockCount};
            </p>
        </div>
    );
}

export default withSelect( (select, ownProps ) => {
    return {
        blockCount: select("core/editor").getBlockCount()
    }
})(WithSelectDemo);