import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';

const HashnodeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={WhiteIcon} IconOutlined={WhiteIcon} />
);

export default HashnodeIcon;