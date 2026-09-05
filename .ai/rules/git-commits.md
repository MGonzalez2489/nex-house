# Git Commit Rules (Husky & Commitlint)

All Git commits must strictly follow the **Conventional Commits** specification:

### **Commit Format**

`<type>(<scope>): <lowercase brief description>`

### **Allowed Types**

> - **feat**: A new feature for the user or system (e.g., feat(auth): add JWT login endpoint)
> - **fix**: A bug resolution (e.g., fix(address): resolve city relationship cascade deletion)
> - **docs**: Documentation changes only
> - **style**: Code formatting, missing semi-colons, white spaces (no logic change)
> - **refactor**: Code change that neither fixes a bug nor adds a feature
> - **test**: Adding or correcting automated tests
> - **chore**: Maintenance tasks, dependency updates, configuration adjustments

### **Rules**

> 1. Description **must** start in lowercase.
> 2. No trailing period at the end of the commit subject line.
> 3. Use imperative, present tense (e.g., add not added or adds).
