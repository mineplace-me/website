![Mineplace Logo](https://mineplace.me/branding/icon.png)

# Mineplace Website

This repository contains the source code for the Mineplace website

# Contributing
#### All contributions are welcome. Mineplace is an open-source project, and we encourage developers of all skill levels to contribute. Whether you're fixing bugs, adding new features, or improving documentation, your help is appreciated!

## Setting up a Local Development Environment
To contribute to the Mineplace website, you'll need to set up a local development environment.

### Prerequisites
- **bun** JavaScript runtime (https://bun.sh/)

### Steps to Set Up
1. **Clone the Repository**: Fork the Mineplace website repository on GitHub https://github.com/mineplace-me/website and clone it
2. **Install Dependencies**: Navigate to the project directory and run `bun install` to install all necessary dependencies.
3. **Run the Development Server**: Start the development server with `bun run start`. The website should now be accessible at `http://localhost:5173`.

### What is happening under the hood?
The project uses Bluemap as its map rendering engine and Mineplace as its web framework. The build process involves compiling Bluemap first and then Mineplace, Bluemap is a Vue app nested within the Mineplace project structure and communicates with Mineplace to provide map data and other functionalities.