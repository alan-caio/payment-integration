import React, { Component } from 'react';
import { fieldType, DragAndDrop } from 'payload/components';

import './index.scss';

const error = 'There was a problem uploading your file.';

const validate = () => true;

class Media extends Component {

  constructor(props) {
    super(props);

    this.state = {
      file: this.props.initialValue
    }

    this.inputRef = React.createRef();
  }

  handleDrop = file => {
    this.inputRef.current.files = file;
  }

  handleSelectFile = () => {
    this.inputRef.current.click();
  }

  render() {
    return (
      <div className={this.props.className} style={{
        width: this.props.width ? `${this.props.width}%` : null,
        ...this.props.style
      }}>
        {this.props.label}
        <input
          style={{ display: 'none' }}
          ref={this.inputRef}
          value={this.props.value || ''}
          onChange={this.props.onChange}
          type="file"
          id={this.props.id ? this.props.id : this.props.name}
          name={this.props.name} />
        {!this.props.value &&
          <DragAndDrop handleDrop={this.handleDrop} handleSelectFile={this.handleSelectFile} />
        }
      </div>
    )
  }
}

export default fieldType(Media, 'media', validate, error);
