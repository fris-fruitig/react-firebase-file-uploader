import {ComponentType} from 'react';
import {Props as UploaderProps} from './index';

export interface Props extends UploaderProps {
  style?: Object,
  className?: string,
  htmlFor?: string,
  id?: string,
  children?: any
}

declare const CustomUploadButton: ComponentType<Props>;
export default CustomUploadButton;
