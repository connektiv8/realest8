# Contributing to RealEst8

Thank you for your interest in contributing to RealEst8! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/realest8.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with descriptive messages: `git commit -m "Add feature: description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Code Standards

### Backend (Django/Python)

- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for classes and methods
- Keep functions focused and single-purpose
- Maximum line length: 100 characters

### Frontend (React/TypeScript)

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components
- Keep components small and reusable
- Use meaningful variable and function names

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
```
Add vendor terms validation to property creation
Fix pagination bug in property list view
Update README with Docker setup instructions
```

## Pull Request Process

1. Update documentation if adding features
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Request review from maintainers

## Feature Requests

- Use GitHub Issues to request features
- Describe the use case and benefit
- Include mockups or examples if applicable

## Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, browser, etc.)

## Questions?

Feel free to open an issue for questions or join our community discussions.
