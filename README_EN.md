# About this OpenFic fork

This is a personal fork of [syrizelink/OpenFic](https://github.com/syrizelink/OpenFic).

For the general feature list, setup instructions, and usage guide, see the [upstream README](https://github.com/syrizelink/OpenFic#readme). This page only lists changes made in this fork.

[Download this fork](https://github.com/fc235/OpenFic/releases) · [Upstream releases](https://github.com/syrizelink/OpenFic/releases) · [中文](./README.md)

## Changes in this fork

### Desktop app

- Windows packages include a matching backend, and the app checks the desktop and backend versions at startup.
- Closing the window can either close the frontend only or stop the local backend as well. The app can remember this choice.
- When only the frontend is closed, background work and LAN access keep running. Opening the app again reconnects to the same backend.
- LAN access can be enabled in Settings. The app shows addresses for available network interfaces and provides copy and QR-code controls.
- When LAN access is changed, the backend waits for running Agent work to finish before restarting.
- Releases, automatic updates, issue links, and Docker images point to `fc235/OpenFic`.

### Editor and controls

- Notes and chapters share the same editor layout. Notes support find, replace, and keyboard shortcuts while remaining stored as Markdown.
- Project cards no longer miss clicks during their hover animation, and projects can be opened with the keyboard.
- In the conversation model menu, a single click changes the current model and a double-click sets the default model.
- For the official DeepSeek API, the balance tooltip shows peak or off-peak pricing in Beijing time and picks a matching message at random.

## Other notes

The project remains licensed under the [Apache License 2.0](./LICENSE). Report fork-specific problems at [fc235/OpenFic Issues](https://github.com/fc235/OpenFic/issues). Please report upstream problems to the upstream repository.
