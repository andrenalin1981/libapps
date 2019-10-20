// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Exports elements for exposing sub pages.
 *
 * @suppress {moduleLoad}
 */
import {LitElement, html} from './lit_element.js';

export class TerminalSettingsCategoryOptionElement extends LitElement {
  static get is() { return 'terminal-settings-category-option'; }

  /** @override */
  render() {
    return html`
        <slot name="title"></slot>
    `;
  }
}

export class TerminalSettingsCategorySelectorElement extends LitElement {
  static get is() { return 'terminal-settings-category-selector'; }

  /** @override */
  render() {
    return html`
        <slot></slot>
    `;
  }

  /** @override */
  connectedCallback() {
    super.connectedCallback();
    this.activate_(lib.notNull(this.firstElementChild));
    this.addEventListener('click', this.clicked_);
  }

  /** @param {!Event} event */
  clicked_(event) {
    let section = event.target;
    while (section.parentElement !== this) {
      // The click event is in the selector, but not on an option.
      if (section.parentElement === null) {
        return;
      }
      section = section.parentElement;
    }
    this.querySelectorAll('[active]')
        .forEach(active => this.deactivate_(active));
    this.activate_(section);
  }

  /** @param {!Element} element */
  activate_(element) {
    element.setAttribute('active', '');
    const id = element.getAttribute('for');
    document.getElementById(id).setAttribute('active-category', '');
  }

  /** @param {!Element} element */
  deactivate_(element) {
    element.removeAttribute('active');
    const id = element.getAttribute('for');
    document.getElementById(id).removeAttribute('active-category');
  }
}
