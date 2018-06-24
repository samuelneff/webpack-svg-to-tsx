/* tslint:disable:max-line-length jsx-alignment */
import React from 'react';

interface ImageProps {
    className:string;
}

export const A:React.StatelessComponent<ImageProps> = props => (
  <svg className={`a ${props.className || ''}`} name="a" />
);

export const B:React.StatelessComponent<ImageProps> = props => (
  <svg className={`b ${props.className || ''}`} name="b" />
);
