const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

import './style.scss';

import SelectDemo from './components/SelectDemo';
import SubscribeDemo from './components/SubscribeDemo';
import WithSelectDemo from './components/WithSelectDemo';


export default registerBlockType("jsforwpadvblocks/data-example", {
    title: __('Data API Example', 'jsforwpadvblocks'),
    description: __('Demo for select, subscribe, dispatch, withSelect, withDispatch and compose', 'jsforwpadvblocks'),
    category: "jsforwpadvblocks",
    icon: 'edit',
    attributes: [],
    edit: props => {
        return (
            <div>
                <p>Data API Block</p>
                <SelectDemo></SelectDemo>
                <SubscribeDemo></SubscribeDemo>
                <WithSelectDemo></WithSelectDemo>
            </div>
        );
    },
    save: props => {
        return (
            <div>
                <p>Data API Block</p>
            </div>
        );
    }
});