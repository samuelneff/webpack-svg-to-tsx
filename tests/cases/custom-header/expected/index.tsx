import React from 'react';

//
// THIS IS A CUSTOM HEADER
//

interface SvgProps {
    className:string;
}

export const A:React.StatelessComponent<SvgProps> = props => (
  <svg className={`a ${props.className || ''}`} name="a" />
);

export const B:React.StatelessComponent<SvgProps> = props => (
  <svg className={`b ${props.className || ''}`} name="b" />
);
