// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Exports an element: hue-slider
 *
 * @suppress {moduleLoad}
 */
import {LitElement, css, html} from './lit_element.js';

export class HueSliderElement extends LitElement {
  static get is() { return 'hue-slider'; }

  /** @override */
  static get properties() {
    return {
      hue: {
        type: Number,
        reflect: true,
      },
    };
  }

  /** @override */
  static get styles() {
    return css`
        :host {
          background-image: linear-gradient(
              to right,
              rgba(255, 0, 0, 1),
              rgba(255, 255, 0, 1),
              rgba(0, 255, 0, 1),
              rgba(0, 255, 255, 1),
              rgba(0, 0, 255, 1),
              rgba(255, 0, 255, 1),
              rgba(255, 0, 0, 1));
          border-radius: 4px;
          cursor: pointer;
          display: block;
          height: 16px;
          position: relative;
          width: 200px;
        }

        #picker {
          border-radius: 100%;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #5F6368;
          box-sizing: border-box;
          cursor: pointer;
          height: 32px;
          left: 50%;
          pointer-events: none;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          z-index: 2;
        }
    `;
  }

  /** @override */
  render() {
    return html`
        <div id="picker" style="left: ${100 * this.hue / 360}%;
            background-color: hsl(${this.hue}, 100%, 50%);">
        </div>
    `;
  }

  constructor() {
    super();

    /** @private {number} */
    this.hue;
  }

  /** @override */
  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('pointerdown', this.onPointerDown_);
    this.addEventListener('pointerup', this.onPointerUp_);
  }

  /** @override */
  disconnectedCallback() {
    this.removeEventListener('pointerdown', this.onPointerDown_);
    this.removeEventListener('pointerup', this.onPointerUp_);

    super.disconnectedCallback();
  }

  /** @param {!Event} event */
  onPointerDown_(event) {
    this.addEventListener('pointermove', this.onPointerMove_);
    this.setPointerCapture(event.pointerId);
    this.update_(event);
  }

  /** @param {!Event} event */
  onPointerMove_(event) {
    this.update_(event);
  }

  /** @param {!Event} event */
  onPointerUp_(event) {
    this.removeEventListener('pointermove', this.onPointerMove_);
    this.releasePointerCapture(event.pointerId);
    this.update_(event);
  }

  /** @param {!Event} event */
  update_(event) {
    this.hue = 360 * lib.f.clamp(
        event.offsetX / this.clientWidth, 0, 1);
    this.dispatchEvent(new CustomEvent('updated', {bubbles: true}));
  }
}

customElements.define(HueSliderElement.is, HueSliderElement);
