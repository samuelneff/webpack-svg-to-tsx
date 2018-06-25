/* tslint:disable:max-line-length jsx-alignment */
import React from 'react';

interface SvgProps {
    className:string;
}

export const C:React.StatelessComponent<SvgProps> = props => (
  <svg className={`c ${props.className || ''}`} name="c" />
);

export const D:React.StatelessComponent<SvgProps> = props => (
  <svg className={`d ${props.className || ''}`} name="d" />
);
