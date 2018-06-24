/* tslint:disable:max-line-length jsx-alignment */
import React from 'react';

interface SvgProps {
    className:string;
}

export const A:React.StatelessComponent<SvgProps> = props => (
  <svg className={`a ${props.className || ''}`} id="a-image" name="a" />
);

export const B:React.StatelessComponent<SvgProps> = props => (
  <svg className={`b ${props.className || ''}`} id="b-image" name="b" />
);
