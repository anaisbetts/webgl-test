// @flow

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component<any> {
  webglCanvas: React.Element<'canvas'>;

  constructor(props: any) {
    super(props);

    this.webglCanvas = React.createRef();
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) { return shader; }

    gl.deleteShader(shader);
    throw new Error(gl.getShaderInfoLog(shader));
  }

  createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) { return program; }

    gl.deleteProgram(program);
    throw new Error(gl.getProgramInfoLog(program));
  }

  resizeCanvas(canvas) {
    const multiplier = window.devicePixelRatio;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;

      return true;
    }

    return false;
  }

  componentDidMount() {
    const gl = this.webglCanvas.current.getContext('webgl2');

    const vertex = this.createShader(gl, gl.VERTEX_SHADER, require('./dumb-vertex-shader.glsl'));
    const fragment = this.createShader(gl, gl.FRAGMENT_SHADER, require('./dumb-fragment-shader.glsl'));
    const program = this.createProgram(gl, vertex, fragment);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      0, 0,
      0, 0.5,
      0.7, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

    this.resizeCanvas(this.webglCanvas.current);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  render() {
    return (
      <div className="App">
        <canvas width={500} height={500} ref={this.webglCanvas} />
      </div>
    );
  }
}

export default App;
