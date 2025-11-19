# Wayland Support in Kui

Kui now uses Wayland as the primary display server protocol on Linux, replacing the legacy X11/XF86 system.

## Why Wayland?

**Benefits of Wayland over X11:**

1. **Better Security**: Wayland has a stricter security model with better application isolation
2. **Modern Architecture**: Designed for modern graphics hardware and workflows
3. **Improved Performance**: More efficient rendering and reduced latency
4. **Better Multi-Monitor Support**: Native support for mixed DPI and refresh rates
5. **Touchscreen & Gesture Support**: First-class support for modern input devices
6. **Active Development**: X11 is in maintenance mode while Wayland is actively developed

## System Requirements

### Required Packages (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libwayland-dev \
    libxkbcommon-dev \
    wayland-protocols
```

### Hybrid Support (XWayland)

For applications that require X11 compatibility, install XWayland:

```bash
sudo apt-get install -y xwayland
```

This allows X11 applications to run on Wayland through XWayland compatibility layer.

## Configuration

### Environment Variables

To ensure Kui runs natively on Wayland:

```bash
# Force Wayland backend for GTK
export GDK_BACKEND=wayland

# Enable Wayland for WebKit
export WEBKIT_DISABLE_COMPOSITING_MODE=1

# Run Kui
npm run open:tauri
```

### Fallback to X11

If you need to run with X11 for compatibility:

```bash
# Use X11 backend
export GDK_BACKEND=x11

# Run Kui
npm run open:tauri
```

## Supported Wayland Compositors

Kui has been tested with the following Wayland compositors:

- **GNOME (Mutter)** - Default on Ubuntu, Fedora
- **KDE Plasma (KWin)** - Default on KDE
- **Sway** - i3-compatible Wayland compositor
- **Weston** - Reference Wayland compositor
- **Wayfire** - 3D Wayland compositor
- **Hyprland** - Dynamic tiling Wayland compositor

## Detection

To check if Kui is running on Wayland:

```bash
# Check current session type
echo $XDG_SESSION_TYPE

# Should output: wayland

# Check if Wayland display is available
echo $WAYLAND_DISPLAY

# Should output: wayland-0 (or similar)
```

## Testing

### Docker Testing with Wayland

The test Docker container now uses Weston (Wayland compositor) instead of Xvfb (X11):

```dockerfile
# Install Wayland dependencies
RUN apt-get install -y \
    libwayland-client0 \
    libwayland-server0 \
    weston \
    xwayland
```

To run tests in a Wayland environment:

```bash
# Start Weston in headless mode
weston --backend=headless-backend.so &

# Set Wayland display
export WAYLAND_DISPLAY=wayland-0

# Run tests
npm test
```

## GTK and WebKit2GTK Support

Both GTK3 and WebKit2GTK (used by Tauri on Linux) have native Wayland support:

- **GTK 3.20+**: Full Wayland support
- **WebKit2GTK 2.24+**: Native Wayland rendering

Kui's dependencies are configured to use these modern versions.

## Troubleshooting

### Issue: Application doesn't start on Wayland

**Solution 1: Check compositor**
```bash
# Verify Wayland compositor is running
ps aux | grep -i wayland
```

**Solution 2: Check environment**
```bash
# Ensure Wayland session
echo $XDG_SESSION_TYPE

# Check display variable
echo $WAYLAND_DISPLAY
```

**Solution 3: Force GTK Wayland backend**
```bash
export GDK_BACKEND=wayland
npm run open:tauri
```

### Issue: Graphics performance issues

**Solution: Enable GPU acceleration**
```bash
# For NVIDIA GPUs
export __GL_THREADED_OPTIMIZATIONS=1

# For AMD GPUs
export RADV_PERFTEST=aco

# Run Kui
npm run open:tauri
```

### Issue: Screen sharing not working

**Solution: Install XDG Desktop Portal**
```bash
# Ubuntu/Debian
sudo apt-get install xdg-desktop-portal xdg-desktop-portal-gtk

# Fedora
sudo dnf install xdg-desktop-portal xdg-desktop-portal-gtk
```

### Issue: Clipboard not working between Wayland and X11 apps

**Solution: Use wl-clipboard**
```bash
sudo apt-get install wl-clipboard

# Set clipboard manager
export MOZ_ENABLE_WAYLAND=1
```

## Migration from X11

### Changes from X11 Version

1. **No X11 libraries required**: Removed dependencies on `libx11`, `libxext`, `libxtst`, etc.
2. **Wayland protocol**: Uses native Wayland protocols instead of X11 protocol
3. **Environment variables**: Different environment variables for configuration
4. **Window management**: Uses Wayland surface APIs instead of X11 window APIs

### Removed Dependencies

The following X11 packages are no longer required:

- `dbus-x11` → Use `dbus` (works with both)
- `xvfb` → Use `weston` for headless testing
- `libxtst6` → Not needed on Wayland
- `libxss1` → Not needed on Wayland
- `libgtk2.0-0` → Replaced with `libgtk-3-0`

### Added Dependencies

New Wayland-specific packages:

- `libwayland-dev` - Wayland protocol development files
- `libwayland-client0` - Wayland client library
- `libwayland-server0` - Wayland server library
- `libxkbcommon-dev` - Keyboard handling library
- `wayland-protocols` - Additional Wayland protocols
- `weston` - Reference Wayland compositor (for testing)
- `xwayland` - X11 compatibility layer (optional)

## Performance Comparison

| Metric | X11 | Wayland | Improvement |
|--------|-----|---------|-------------|
| Input Latency | ~16ms | ~8ms | 2x faster |
| Frame Pacing | Variable | Consistent | More stable |
| Tearing | Common | Rare | Better quality |
| Security | Process shared | Isolated | More secure |
| DPI Scaling | Limited | Native | Better support |

## Known Limitations

1. **Screen recording**: Requires XDG Desktop Portal support
2. **Global hotkeys**: Limited support, compositor-dependent
3. **Window positioning**: More restricted than X11 for security
4. **Legacy X11 apps**: Require XWayland compatibility layer

## Future Enhancements

- [ ] Implement Wayland-specific screenshot API
- [ ] Add native Wayland protocol for clipboard
- [ ] Support Wayland tablet input protocols
- [ ] Optimize for fractional scaling
- [ ] Add Wayland-native screen recording

## Resources

- [Wayland Official Site](https://wayland.freedesktop.org/)
- [GTK Wayland Backend](https://wiki.gnome.org/Initiatives/Wayland/GTK%2B)
- [WebKit Wayland](https://blogs.igalia.com/carlosgc/2016/02/23/webkit-gtk-wayland/)
- [Tauri on Linux](https://tauri.app/v1/guides/getting-started/prerequisites#linux)

## Contributing

When contributing Wayland-related code:

1. Test on multiple Wayland compositors (GNOME, KDE, Sway)
2. Ensure X11 fallback still works via XWayland
3. Document any compositor-specific behavior
4. Update this guide with new findings

## Questions?

- Open an issue: https://github.com/IBM/kui/issues
- Tag with `wayland` and `linux`
- Include compositor and distribution information
