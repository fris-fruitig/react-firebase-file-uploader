// @flow
import React from 'react';
import FirebaseFileUploader from './index';

import type { Props as UploaderProps } from './index';

type Props = UploaderProps & {
  style?: Object,
  className?: string,
  htmlFor?: string,
  id?: string,
  children?: any
};

const CustomUploadButton = (props: Props) => {
  const {
    style,
    className,
    children,
    htmlFor = props.id,
    ...inputProps
  } = props;

  const buttonStyle = Object.assign(
    {},
    {
      pointer: 'cursor'
    },
    style
  );

  return (
    <label style={buttonStyle} className={className} htmlFor={htmlFor}>
      {children}<FirebaseFileUploader hidden {...inputProps} />
    </label>
  );
};

export default CustomUploadButton;
