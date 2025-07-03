# Contributing to AIPort

Thank you for your interest in contributing to AIPort! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which promotes a respectful and inclusive community.

## How to Contribute

There are many ways to contribute to AIPort:

1. **Report Bugs**: If you find a bug, please create an issue describing the problem, how to reproduce it, and any relevant information about your environment.

2. **Suggest Features**: Have an idea for a new feature? Submit an issue describing your idea and how it would benefit the project.

3. **Improve Documentation**: Help us improve our documentation by fixing typos, adding examples, or clarifying explanations.

4. **Submit Code**: Implement new features, fix bugs, or improve existing code.

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/AIPort.git`
3. Install dependencies:

```bash
# Install main project dependencies
npm install

# Install SDK dependencies
cd sdk/typescript
npm install

# Install demo app dependencies
cd ../../demos/todo-app
npm install
```

## Development Workflow

1. **Create a branch**: Create a branch for your changes
   ```
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**: Implement your changes following our coding style and guidelines

3. **Write tests**: Add tests for your changes to ensure they work as expected and prevent regressions

4. **Run tests**: Make sure all tests pass
   ```
   npm test
   ```

5. **Format your code**: Ensure your code follows our style guidelines
   ```
   npm run format
   ```

6. **Commit your changes**: Write clear, concise commit messages
   ```
   git commit -m "feat: add capability validation feature"
   ```

7. **Push your changes**: Push your changes to your fork
   ```
   git push origin feature/your-feature-name
   ```

8. **Submit a pull request**: Create a pull request from your fork to the main repository

## Pull Request Guidelines

- Keep pull requests focused on a single topic
- Follow the pull request template
- Include tests for new features or bug fixes
- Update documentation for API changes
- Make sure all tests pass
- Be responsive to feedback and questions

## Coding Style

- Use TypeScript for all new code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the principle of least surprise

## Architecture Guidelines

When contributing to AIPort, keep in mind the following architectural principles:

1. **Protocol First**: The protocol specification is the foundation of the project. Changes to the protocol should be carefully considered and documented.

2. **Backward Compatibility**: Maintain backward compatibility when possible. Breaking changes should be well-documented and versioned.

3. **Security**: Security is a priority. All code should follow security best practices.

4. **Modularity**: Keep components modular and loosely coupled to facilitate maintenance and extension.

5. **Cross-Platform**: The protocol and reference implementations should work across different platforms and environments.

## License

By contributing to AIPort, you agree that your contributions will be licensed under the project's MIT License. 