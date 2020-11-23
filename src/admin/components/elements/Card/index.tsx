import React from 'react';
import Button from '../Button';
import { Props } from './types';

import './index.scss';

const baseClass = 'card';

const Card: React.FC<Props> = (props) => {
  const { title, actions, onClick } = props;

  const classes = [
    baseClass,
    onClick && `${baseClass}--has-onclick`,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <h5>
        {title}
      </h5>
      {actions && (
        <div className={`${baseClass}__actions`}>
          {actions}
        </div>
      )}
      {onClick && (
        <Button
          className={`${baseClass}__click`}
          buttonStyle="none"
          onClick={onClick}
        />
      )}
    </div>
  );
};

export default Card;
