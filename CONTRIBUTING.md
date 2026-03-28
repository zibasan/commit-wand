# Contributing to commit-wand 🪄

First off, thank you for considering contributing to `commit-wand`! It's people like you that make OSS such a great community.

## 🛠 Development Setup

If you want to work on the code, follow these steps to set up your local environment:

1. **Fork the repository** and clone your fork locally.
2. **Install dependencies** using `pnpm`:
   ```bash
   pnpm install
   ```
3. **Run the build script** to compile TypeScript:
   ```bash
   pnpm run build
   ```
4. **Test your changes locally**. You can run the CLI directly from the source:
   ```bash
   pnpm dev path/to/dummy-message.txt
   ```

## 📝 Commit Message Guidelines

Ironically (or appropriately), **this project strictly follows [the Conventional Commits](https://www.conventionalcommits.org/) specification.**

Since you are contributing to `commit-wand`, please use `commit-wand` to format your commit messages!
If you have husky initialized locally, it will automatically guide you. Otherwise, please ensure your commit messages follow the `type(scope): subject` format.

## 🚀 Pull Request Process

1. Create a new branch for your feature or bugfix (e.g., `feat/add-new-magic` or `fix/prompt-typo`).
2. Make your changes and ensure the code is well-formatted. Run linters before committing:
   ```bash
   pnpm check
   ```
3. Commit your changes using Conventional Commits.
4. Push to your fork and open a Pull Request against the `main` branch.
5. Provide a clear and descriptive title for your PR, and explain what you changed and why.

Thank you for your contribution! ✨
