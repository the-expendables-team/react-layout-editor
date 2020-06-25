import React from 'react';
import { Input } from '../source';
import StringInput from '../source/Inputs/String.jsx';
import NumberInput from '../source/Inputs/Number.jsx';
import BooleanInput from '../source/Inputs/Boolean.jsx';
import { action, actions } from '@storybook/addon-actions';
import { withKnobs, text, select } from "@storybook/addon-knobs";

const wrap = { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    fontFamily: 'Ubuntu Mono'
}

export default { 
    title: 'Inputs', 
    component: Input,
    decorators: [
        withKnobs, 
        story => <div style={ wrap }>{ story() }</div>
    ] 
};


export const WithAction = () => {

    const getSelect = () => {
        const options = [
            'Select',
            'Boolean',
            'String',
            'Number'
        ]
        return select('Input Type', options, 'String');
    }
    
    // let {  onChange, label, description } = this.props;
    return (
        <Input 
            label={ text('Label', 'Input Label') }
            name={ text('Name', 'Input Name') }
            onChange={ action('onChange') }
            description={ text('Description', 'Input description') }
            value={ text('Value', 'Change Me') } 
            options={[
                'Handle',
                'With',
                'Care',
            ]}
            type={ getSelect() }/>
    );  
      
}

export const String = () =>{
    return (
        <StringInput
            label={text('Label', 'Input Label')}
            name={text('Name', 'Input Name')}
            onChange={action('onChange')}
            description={text('Description', 'Input description')}
            value={text('Value', 'Change Me')} />
    );
}

export const Number = () =>{
    return (
        <NumberInput
            label={text('Label', 'Number Label')}
            name={text('Name', 'Input Name')}
            onChange={action('onChange')}
            description={text('Description', 'Input description')}
            value={text('Value', 234)} />
    );
}

export const Boolean = () =>{
    return (
        <BooleanInput
            label={text('Label', 'Boolean Label')}
            name={text('Name', 'Input Name')}
            onChange={action('onChange')}
            description={text('Description', 'Input description')}
            value={text('Value', false)} />
    );
}
