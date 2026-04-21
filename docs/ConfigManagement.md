# Configuration Management

This document describes the methodology around the configuration management we will follow.

## Coding standards

### Comments

Code should be well commented with frequent and descriptive comments.

Functions should have a comment describing its purpose, the inputs and outputs in detail.


### Consistent naming

For python files we will name variables and functions **snake_case**

For vue files variables and functions will use **camelCase**

## Branching Methodology

The branching methodology for this project will be as follows:

- **main**: This branch will be used for stable and feature ready versions of the project.

- **develop**: This branch will be used to develop the project, all finished tasks will be merged into develop after they have been reviewed by another team member.

### Support branches

Each task will have its own branch that will be named after the task it is associated with using this format:

*Issue#*-*name*-*of*-*issue*

After the task is finished a pull request to develop is created and, after approval, merged into develop.

### Bugfixes

If unexpected bugs get found after merging then a bugfix task will be created and a branch will be made.

## Commit messages

Commit messages will have two parts a *type* and the *description*.

```
<type>: <description>
```

Where:

- `<type>` Will be one of the following:
    - `fix` For fixing errors.
    - `feat` For new features.
    - `build` For changes in compilation or external dependancies.
    - `chore` For maintenance tasks that do not affect code.
    - `docs` For document tasks.
    - `style` For styling changes.
    - `refactor` For refactoring.
    - `test` For adding or modifying tests.
- `<description>` Is a small description about the changes made.

## Reviews

If the review is `approved`:

The approval message must include a brief explanation on how the implementation was tested and that it works.

If the review is `request changes`:

The request changes message must include what features did not work, and what changes need to be made.