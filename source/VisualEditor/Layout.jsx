import React from 'react';
import ReactDom from 'react-dom';
import utils from '../utils';
import editors from '../editors';
import ResizeHandle from './ResizeHandle';
import Placeholder from './Placeholder';

export default class Layout extends React.PureComponent{
    constructor(props){
        super(props);
        this.path = (props.path || []).concat(props.value.id);
        this.key = this.path.join('/');
        this.children = [];
        this.state = {
            error: null,
            isAdded: props.editor.addedChild === this.key,
            isRendered: false,
            isRemoved: false,
            isRenderComplete: false,
        };
    }
    componentDidMount(){
        let {editor, parent} = this.props;
        this.el = this.el || ReactDom.findDOMNode(this);
        editor.bind(this.key, this.update, this);
        // this.box = this.el && this.el.getBoundingClientRect();
        if(this.state.isAdded){
            // this animates the widget when it is added by drop
            this.componentEl = this.el.firstElementChild;
            let { display, position } = getComputedStyle(this.componentEl);
            this.componentEl.style.position = 'absolute';
            this.setState({
                isRendered: true
            }, e => {
                let { width, height } = this.componentEl.getBoundingClientRect();
                let { minWidth, minHeight } = getComputedStyle(this.el);
                this.setState({
                    isSampled: true
                }, e => {
                    this.componentEl.style.display = 'none';
                    this.componentEl.style.position = 'relative';
                    this.el.style.minWidth = '0px';
                    this.el.style.minHeight = '0px';
                    setTimeout(e => {
                        this.el.style.minWidth = `${width}px`;
                        this.el.style.minHeight = `${height}px`;
                        setTimeout(e => {
                            this.el.style.minWidth = minWidth || `auto`;
                            this.el.style.minHeight = minHeight || `auto`;
                            this.componentEl.style.display = display ||'block';
                            this.componentEl.style.position = position ||'relative';
                            this.setState({
                                isRenderComplete: true
                            })
                        }, 440)
                    }, 0)
                })
            });
        }
    }
    componentWillUnmount(){
        let {editor} = this.props;
        editor.unbind(this.key);
    }
    componentDidCatch(error){
        console.error(error);
        this.setState({ error });
    }
    componentDidUpdate(){
        let { editor } = this.props;
        if(!this.state.isRemoved && (editor.removed === this.key)){
            this.componentEl = this.componentEl || this.el.firstElementChild;
            let { width, height } = this.el.getBoundingClientRect();
            this.el.style.minWidth = `${width}px`;
            this.el.style.minHeight = `${height}px`;
            if(this.componentEl){
                this.componentEl.style.display = 'none';
            }
            setTimeout(e => {
                this.el.style.minWidth = `0px`;
                this.el.style.minHeight = `0px`;
            }, 40)
        }
    }
    update = () => {
        this.forceUpdate();
    };
    onMouseEnter = (e) => {
        let { editor } = this.props;
        editor && editor.onHover(this.key, e);
    };
    onMouseLeave = (e) => {
        let { editor, parent } = this.props;
        if(parent){
            parent.onMouseEnter(e);
        }
        else if(editor){
            editor.onHover(null, e);
        }
    };
    
    onDragOver = (e) => {
        let { editor } = this.props;
        e.preventDefault();
        e.stopPropagation();
        return editor.onDragOver(this.key, {x: e.clientX, y: e.clientY});
    };
    onDragLeave = (e) => {
        e.stopPropagation();
    };
    onClick = (e) => {
        let { editor, value } = this.props;
        e.stopPropagation();
        editor.onSelect(this.key, value);
    };
    onChange = (value) => {
        let { editor } = this.props;
        editor.onChange(this.key, value);
    };
    onDragStart = (e) => {
        let { type = 'react-drag', value, editor } = this.props;
        e.stopPropagation();
        if(editor.resizing){ 
            e.preventDefault();
            return; 
        }
        e.dataTransfer.setData(type, JSON.stringify({ ...value, id: utils.uuid() }));
        setTimeout(e => 
            this.props.editor.deleteChild(this.key)
        , 0)
    };
    onStartResize = (e) => {
        let { editor, parent } = this.props;
        editor.startResize(this.key, e, parent && parent.isHorizontal);
    };
    renderPlaceholder = (index, isButton) => {
        return (
            <Placeholder 
                editor={ this.props.editor }
                key={`placeholder-${index}`}
                id={ `${this.key}:${index}` }
                isButton={ isButton }
            />
        );
    };
    render(){
        let { style, value, widgets, editor, parent, path, index, ...props } = this.props;
        let { isAdded, isRendered, isSampled, isRenderComplete } = this.state;
        let widget = value.type && widgets.find(widget => widget.id === value.type);
        let Component = widget ? widget.component : value.type;
        let key = this.key;


        if(this.state.error){
            return (
            <div style={{ color: 'red'}}>
                <div>{this.state.error.toString()}</div>
                <div>{this.state.error.stack.toString()}</div>
            </div>
            );
        }
        if(value.type && !Component && (typeof Component !== 'string')){
            return (
                <div>Component "{value.type}" is missing</div>
            );
        }
        
        let isHovered = editor.hovered === key;
        let isChildHovered = editor.hovered && editor.hovered.indexOf(key) === 0;
        let isSelected = editor.selected === key;
        let isDraggedOver = editor.draggedOver === key;
        let widgetProps = value.props;
        let children = null;
        let elStyle = {
            display: (isAdded && !isRendered) ? 'none' : 'flex',
            flexDirection: 'column',
            position: 'relative',
            whiteSpace: 'nowrap',
            ...value.layout
        };
        if(isSampled && !isRenderComplete){
            elStyle.paddingLeft = 0;
            elStyle.paddingRight = 0;
            elStyle.paddingTop = 0;
            elStyle.paddingBottom = 0;
        }
        if(!editor.resizing){
            elStyle.transition = '0.4s ease';
        }
        this.isHorizontal = elStyle.flexDirection.indexOf('row') > -1 || value.isHorizontal;
        let isHorizontal = parent && parent.isHorizontal;
        let shouldResize = !(value.resize === false);
        let Editor = widget && widget.editor || editors[value.type];
        if(Editor){
            widgetProps = { ...value.props, _onChange: this.onChange, _value: value }
            Component = Editor;
        }
        if(value.children){
            children = [];
            let lastIndex = value.children.length + 1;
            value.children.map((child, i) => {
                // valid children should be wrapped with placeholders on both sides
                // but null children should be replaced with placeholders
                if(!child){
                    children.push(
                        this.renderPlaceholder(i, false)
                    )
                }
                else if((i === 0) || (value.children[i - 1])){
                    children.push(
                        this.renderPlaceholder(i, false)
                    )
                }
                child && children.push(
                    <Layout
                        ref={ `child-${i}` }
                        key={ child.id }
                        index={i}
                        value={ child } 
                        widgets={ widgets } 
                        editor={ editor }
                        path={ this.path }
                        parent={this}
                    />
                );
                // children.push(
                //     <ResizeHandle isHorizontal={ isHorizontal }/>
                // )
            });
            children.push(
                this.renderPlaceholder(lastIndex, true)
            )
        }

        return (
            <div
                ref={ el => this.el = el }
                data-layout={this.key}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                // onClick={this.onClick}
                onMouseDown={this.onClick}
                draggable="true"
                onDragStart={ this.onDragStart }
                style={ elStyle } 
                { ...props }
            >
                {
                    Component ? (
                        children ? 
                            React.createElement(Component, widgetProps, ...children)
                            : React.createElement(Component, widgetProps)
                    ) : children
                }
                
                <div 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: isDraggedOver ? '2px solid #a22' : isSelected ? '2px solid #2a2' : isChildHovered ? '2px solid #22a' : 0,
                        background: isHovered ? 'rgba(32,32,176, 0.05)' : 'transparent',
                        pointerEvents: 'none'
                    }}
                >
                </div>
                {
                    shouldResize ?
                    <ResizeHandle 
                        isVisible={ isChildHovered || isHovered }
                        isHorizontal={ isHorizontal } 
                        onStartResize={ this.onStartResize }
                        onMouseEnter={ this.onMouseEnter }
                    />
                    : null 
                }
            </div>
        );
    }
}