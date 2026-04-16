import React from 'react'
import { Gradient } from "whatamesh";
import "./heroWithSlope.css"
import { useEffect } from 'react';
const HeroWithSlope = (props) => {
  useEffect(() => {
    const canvasId = props.canvasId || 'gradient-canvas';
    const gradient = new Gradient();
    setTimeout(() => {
      gradient.initGradient(`#${canvasId}`);
    }, 100);
  }, [props.canvasId]);

  return (
    <>
      <div className='about-hero'>
        <div className='about-overlay'></div>
        <canvas id={props.canvasId || 'gradient-canvas'} className='about-canvas' data-js-darken-top data-transition-in></canvas>
        <div>
          <h1>{props.pName}</h1>
        </div>
      </div>
    </>
  )
}

export default HeroWithSlope