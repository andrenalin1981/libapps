// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Exports the base class for terminal settings elements.
 * This element automatically handles data binding between the managed
 * preferences and the preferences being displayed in the ui.
 *
 * @suppress {moduleLoad}
 */
import {LitElement} from './lit_element.js';

export class TerminalSettingsElement extends LitElement {
  constructor() {
    super();

    /** @type {string} */
    this.preference;
    /** @protected {string|boolean|number} */
    this.preferenceValue_;
    /** @protected {string|boolean|number} */
    this.uiValue_;
    this.boundPreferenceChanged_ = this.preferenceChanged_.bind(this);
  }

  /** @override */
  connectedCallback() {
    super.connectedCallback();

    this.preferenceChanged_(
        window.preferenceManager.get(this.preference));
    window.preferenceManager.addObserver(
        this.preference,
        this.boundPreferenceChanged_);
  }

  /** @override */
  disconnectedCallback() {
    super.disconnectedCallback();

    window.preferenceManager.removeObserver(
        this.preference,
        this.boundPreferenceChanged_);
  }

  /**
   * @param {string|boolean|number} value
   * @protected
   */
  uiChanged_(value) {
    this.uiValue_ = value;
    window.preferenceManager.set(this.preference, this.uiValue_);
  }

  /**
   * @param {string|boolean|number} value
   * @private
   */
  preferenceChanged_(value) {
    this.preferenceValue_ = this.uiValue_ = value;
  }
}
