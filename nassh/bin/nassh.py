#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Copyright 2018 The Chromium OS Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""Common nassh util code."""

from __future__ import print_function

import os
import sys


BIN_DIR = os.path.dirname(os.path.realpath(__file__))
DIR = os.path.dirname(BIN_DIR)
LIBAPPS_DIR = os.path.dirname(DIR)


sys.path.insert(0, os.path.join(LIBAPPS_DIR, 'libdot', 'bin'))

# pylint: disable=unused-import
import libdot  # pylint: disable=wrong-import-position


# Wrappers around nassh/bin/ programs for other tools to access directly.
mkdeps = libdot.HelperProgram('mkdeps', os.path.join(BIN_DIR, 'mkdeps'))
