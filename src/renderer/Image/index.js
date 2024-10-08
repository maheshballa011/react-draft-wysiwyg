import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier, SelectionState } from 'draft-js';
import classNames from 'classnames';
import Option from '../../components/Option';
import remove from '../../../images/delete.svg';
import KeyDownHandler from "../../event-handler/keyDown";
import './styles.css';

const getImageComponent = config => class Image extends Component {
  static propTypes: Object = {
    block: PropTypes.object,
    contentState: PropTypes.object,
  };

  state: Object = {
    hovered: false,
    activeImage: ''
  };

  constructor(props) {
    super(props);
    this.removeEntity = this.removeEntity.bind(this);
  }

  componentWillUnmount() {
    this.setState({activeImage: ''});
    KeyDownHandler.deregisterCallBack(this.removeEntity);
  }

  setEntityAlignmentLeft: Function = (): void => {
    this.setEntityAlignment('left');
  };

  setEntityAlignmentRight: Function = (): void => {
    this.setEntityAlignment('right');
  };

  setEntityAlignmentCenter: Function = (): void => {
    this.setEntityAlignment('none');
  };

  setEntityAlignment: Function = (alignment): void => {
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    contentState.mergeEntityData(
      entityKey,
      { alignment },
    );
    config.onChange(EditorState.push(config.getEditorState(), contentState, 'change-block-data'));
    this.setState({
      dummy: true,
    });
  };

  toggleHovered: Function = (): void => {
    const hovered = !this.state.hovered;
    this.setState({
      hovered,
    });
  };

  renderDeletionOption(): Object {
    KeyDownHandler.registerCallBack(this.removeEntity);
    return (
      <Option
      title='Remove Image'
        onClick={this.removeEntity.bind(this, {key: 'delete'})}
        className="rdw-image-deletion-option"
      >
        <img src={remove} />
      </Option>
    );
  }

  renderAlignmentOptions(alignment, isDeletionEnabled): Object {
    return (
      <div
        className={classNames(
          'rdw-image-alignment-options-popup',
          {
            'rdw-image-alignment-options-popup-right': alignment === 'right',
          },
        )}
      >
        <Option
          onClick={this.setEntityAlignmentLeft}
          className="rdw-image-alignment-option"
        >
          L
        </Option>
        <Option
          onClick={this.setEntityAlignmentCenter}
          className="rdw-image-alignment-option"
        >
          C
        </Option>
        <Option
          onClick={this.setEntityAlignmentRight}
          className="rdw-image-alignment-option"
        >
          R
        </Option>
        {isDeletionEnabled && this.renderDeletionOption()}
      </div>
    );
  }


  removeEntity: Function = (event): void => {
    if(event &&  (event.key.toLowerCase() === 'backspace' || event.key == 'delete')){
      const { block, contentState } = this.props;
      if(this.state.activeImage == block || event.key == 'delete') {
        this.setState({
          activeImage: ''
        })
        const blockKey = block.getKey();
          const afterKey = contentState.getKeyAfter(blockKey);
          const targetRange = new SelectionState({
              anchorKey: blockKey,
              anchorOffset: 0,
              focusKey: afterKey,
              focusOffset: 0
          });
          let newContentState = Modifier.setBlockType(
            contentState,
            targetRange,
            'unstyled'
          );
      
          newContentState = Modifier.removeRange(newContentState, targetRange, 'backward');
          config.onChange(EditorState.push(config.getEditorState(), newContentState, 'remove-range'));
      }
    }
  };

  handleKeyDown = (event) => {
    event.preventDefault();
    console.log("keydown here")
    if (event.key === 'Backspace') {
      this.removeEntity();
    }
  }

  render(): Object {
    const { block, contentState } = this.props;
    const { hovered } = this.state;
    const { isReadOnly, isImageAlignmentEnabled, isImageDeletionEnabled } = config;
    const isDeletionEnabled = isImageDeletionEnabled();
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src, alignment, height, width, alt } = entity.getData();

    return (
      <span
        onMouseEnter={this.toggleHovered}
        onMouseLeave={this.toggleHovered}
        onClick={()=>{
          this.setState({
            activeImage: this.props.block
          })
        }}
        onKeyDown={this.handleKeyDown}
        className={classNames(
          'rdw-image-alignment',
          {
            'rdw-image-left': alignment === 'left',
            'rdw-image-right': alignment === 'right',
            'rdw-image-center': !alignment || alignment === 'none',
          },
        )}
      >
        <span className="rdw-image-imagewrapper">
          <img
            src={src}
            alt={alt}
            style={{
              height,
              width,
            }}
          />
          {
            !isReadOnly() && hovered && isImageAlignmentEnabled() || isDeletionEnabled ?
              this.renderAlignmentOptions(alignment, isDeletionEnabled)
              :
              undefined
          }
        </span>
      </span>
    );
  }
};

export default getImageComponent;
