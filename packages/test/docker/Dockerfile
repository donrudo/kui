#
# Copyright 2021 The Kubernetes Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

FROM node:18-slim

# install debian packages
# note: git is needed by npm install in tests
# Using Wayland instead of X11 for modern display server support
RUN apt-get update \
 && apt-get install -y \
    bash git dbus make g++ libnss3 libasound2 libgconf-2-4 libgtk-3-0 \
    libwayland-client0 libwayland-server0 weston xwayland

ADD chromedriver /chromedriver
