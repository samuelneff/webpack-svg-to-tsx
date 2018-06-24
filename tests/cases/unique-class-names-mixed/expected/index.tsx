/* tslint:disable:max-line-length jsx-alignment */
import React from 'react';

interface SvgProps {
    className:string;
}

export const A:React.StatelessComponent<SvgProps> = props => (
  <svg className={`a ${props.className || ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="-4771.999 -2700.999 22 20.999" name="a">
    <defs>
        <style dangerouslySetInnerHTML={{__html: `
            .a-cls-1 {
                fill: #263238;
                fill-rule: evenodd;
            }
        `}} />
    </defs>
    <path id="Path_235" data-name="Path 235" className="a-cls-1"
          d="M426.6,433.8c-1.35-.671-3.29-2.33-6.21-2.88a13.589,435.115,426.6,433.8Z"
          transform="translate(-5179.36 -3119.055)"/>
    <path className="other" d=""/>
</svg>
);

export const B:React.StatelessComponent<SvgProps> = props => (
  <svg className={`b ${props.className || ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="-4771.999 -2700.999 22 20.999" name="b">
    <defs>
        <style dangerouslySetInnerHTML={{__html: `
            .b-cls-1 {
                fill: #263238;
                fill-rule: evenodd;
            }
        `}} />
    </defs>
    <path id="Path_236"
          data-name="Path 236"
          className="b-cls-1"
          d="M426.6,433.8Z"/>
    <path className="other" d=""/>
</svg>
);
