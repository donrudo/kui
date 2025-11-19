// Copyright 2025 The Kubernetes Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! Window management utilities for Kui

use log::debug;
use tauri::PhysicalPosition;

/// Default window dimensions
#[allow(dead_code)]
pub const DEFAULT_WIDTH: u32 = 1280;
#[allow(dead_code)]
pub const DEFAULT_HEIGHT: u32 = 960;

/// Popup window dimensions
#[allow(dead_code)]
pub const POPUP_WIDTH: u32 = 600;
#[allow(dead_code)]
pub const POPUP_HEIGHT: u32 = 400;

/// Calculate position for a new regular window
#[allow(dead_code)]
pub fn get_position_for_regular_window(window_count: usize) -> PhysicalPosition<i32> {
    let delta = (window_count * 40) as i32;
    PhysicalPosition::new(100 + delta, 100 + delta)
}

/// Calculate position for a popup window
#[allow(dead_code)]
pub fn get_position_for_popup(window_count: usize) -> PhysicalPosition<i32> {
    let delta = ((window_count - 1) * 40) as i32;
    // Position in the upper right
    PhysicalPosition::new(800, 100 + delta)
}

/// Initialize window management subsystem
#[allow(dead_code)]
pub fn init() {
    debug!("Window module initialized");
}
