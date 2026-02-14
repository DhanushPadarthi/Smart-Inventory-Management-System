# Git Workflow Quick Reference Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Daily Workflow](#daily-workflow)
3. [Common Commands](#common-commands)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)

---

## 🚀 Initial Setup

### First Time Only

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Smart Inventory Management System"

# 2. Check available branches
git branch -a

# 3. Switch to YOUR branch
git checkout <your-branch-name>
# Examples:
# git checkout dhanush
# git checkout tharun
# git checkout mageswari
# git checkout indra
# git checkout akash
# git checkout kazi
# git checkout punyashree

# 4. Verify you're on the correct branch
git branch
# You should see * next to your branch name
```

---

## 📅 Daily Workflow

### Every Day Before Starting Work

```bash
# Step 1: Switch to your branch
git checkout <your-branch>

# Step 2: Get latest changes from main
git pull origin main

# Step 3: Check status
git status
```

### While Working

```bash
# Check what you've changed
git status

# See detailed changes
git diff
```

### After Completing Work

```bash
# Step 1: Check what files changed
git status

# Step 2: Stage all changes
git add .

# OR stage specific files
git add backend/auth.py
git add frontend/dashboard.html

# Step 3: Commit with clear message
git commit -m "Implemented user authentication with password hashing"

# Step 4: Push to YOUR branch
git push origin <your-branch>
```

---

## 🛠️ Common Commands

### Branch Management

```bash
# See all branches
git branch -a

# Create new branch
git branch <branch-name>

# Switch to a branch
git checkout <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>

# Delete a branch (local)
git branch -d <branch-name>
```

### Checking Status

```bash
# See modified files
git status

# See commit history
git log

# See commit history (one line)
git log --oneline

# See recent 5 commits
git log -5

# See changes in files
git diff

# See changes in staged files
git diff --staged
```

### Adding & Committing

```bash
# Stage all changes
git add .

# Stage specific file
git add <filename>

# Stage multiple files
git add file1.py file2.html file3.css

# Commit with message
git commit -m "Your message here"

# Add and commit in one step
git commit -am "Your message"  # Only for tracked files
```

### Pushing & Pulling

```bash
# Pull latest from main to your branch
git pull origin main

# Push your changes to your branch
git push origin <your-branch>

# Push for first time (set upstream)
git push -u origin <your-branch>

# After setting upstream, just use
git push
```

---

## 🆘 Troubleshooting

### Problem: I'm on the wrong branch!

```bash
# Save your changes temporarily
git stash

# Switch to correct branch
git checkout <correct-branch>

# Apply your changes
git stash pop
```

### Problem: I committed to the wrong branch!

```bash
# Copy the commit hash from log
git log --oneline

# Switch to correct branch
git checkout <correct-branch>

# Apply that commit here
git cherry-pick <commit-hash>

# Go back to wrong branch
git checkout <wrong-branch>

# Remove the commit (keep changes)
git reset --soft HEAD~1
```

### Problem: I want to undo my last commit

```bash
# Undo commit, keep changes
git reset --soft HEAD~1

# Undo commit, discard changes (CAREFUL!)
git reset --hard HEAD~1

# Undo last 2 commits
git reset --soft HEAD~2
```

### Problem: I have merge conflicts

```bash
# Step 1: Try to merge/pull
git pull origin main

# Step 2: Git will tell you which files have conflicts

# Step 3: Open those files and look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# Step 4: Edit the file, choose what to keep, remove markers

# Step 5: Stage the resolved files
git add <resolved-file>

# Step 6: Complete the merge
git commit -m "Resolved merge conflicts"

# Step 7: Push
git push origin <your-branch>
```

### Problem: I want to discard all local changes

```bash
# CAREFUL - This cannot be undone!

# Discard changes in specific file
git checkout -- <filename>

# Discard all changes
git reset --hard HEAD

# Remove untracked files
git clean -fd
```

### Problem: I accidentally committed sensitive data

```bash
# Remove file from Git but keep locally
git rm --cached <filename>

# Commit the removal
git commit -m "Removed sensitive file"

# Push
git push origin <your-branch>

# Make sure file is in .gitignore
echo "<filename>" >> .gitignore
```

---

## ✅ Best Practices

### Commit Messages

**Good commit messages:**
```bash
git commit -m "Added user login endpoint with JWT authentication"
git commit -m "Fixed bug in inventory stock calculation"
git commit -m "Updated dashboard UI with responsive design"
git commit -m "Implemented CSV export for sales reports"
```

**Bad commit messages:**
```bash
git commit -m "Updated files"
git commit -m "Changes"
git commit -m "Fix"
git commit -m "Work in progress"
```

### Commit Message Format

```bash
# Use present tense
✅ "Add feature" not "Added feature"

# Be specific
✅ "Fix null pointer in product search"
❌ "Fix bug"

# Keep it short but descriptive
✅ "Implement user authentication with password hashing"
❌ "Update"
```

### When to Commit

- ✅ After completing a feature
- ✅ After fixing a bug
- ✅ Before taking a break
- ✅ At the end of the day
- ❌ In the middle of broken code
- ❌ With syntax errors

### What NOT to Commit

- ❌ `.env` files (passwords, API keys)
- ❌ `node_modules/` or `venv/` folders
- ❌ Database files (`.db`, `.sqlite`)
- ❌ Personal IDE settings
- ❌ Log files
- ❌ Temporary files

---

## 📊 Git Command Cheat Sheet

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push origin <branch>` | Push to branch |
| `git pull origin main` | Pull from main |
| `git checkout <branch>` | Switch branch |
| `git branch` | List branches |
| `git log --oneline` | View commits |
| `git diff` | See changes |
| `git stash` | Save changes temporarily |
| `git stash pop` | Apply saved changes |
| `git reset --soft HEAD~1` | Undo last commit |
| `git checkout -- <file>` | Discard file changes |

---

## 🎯 Team-Specific Commands

### For Team Lead (Dhanush)

```bash
# Merge all branches to main
git checkout main
git pull origin main

git merge dhanush
git merge tharun
git merge mageswari
git merge indra
git merge akash
git merge kazi
git merge punyashree

git push origin main
```

### For Team Members

```bash
# Daily routine
git checkout <your-branch>
git pull origin main
# ... work ...
git add .
git commit -m "Descriptive message"
git push origin <your-branch>
```

---

## 🔍 Checking Your Work

```bash
# Before committing
git status                    # What files changed?
git diff                      # What are the changes?

# After committing
git log --oneline -5          # See recent commits

# Before pushing
git log origin/<your-branch>..HEAD   # See commits not yet pushed
```

---

## 🚫 DON'T DO THESE

```bash
# ❌ Never do these:
git push -f                   # Force push (destroys history)
git push origin main          # Push to main (only team lead)
git add *                     # May include unwanted files
git commit -am "fix"          # Vague message
```

---

## ✨ Pro Tips

1. **Commit Often**: Small commits are better than large ones
2. **Pull Before Push**: Always pull latest changes before pushing
3. **Check Status**: Run `git status` frequently
4. **Read Messages**: Read Git's error messages carefully
5. **Use .gitignore**: Never commit sensitive or generated files
6. **Branch Names**: Use descriptive branch names
7. **Test Before Commit**: Make sure your code works
8. **Ask for Help**: Don't hesitate to ask team lead if stuck

---

## 📞 Need Help?

If you encounter any Git issues:
1. Don't panic!
2. Don't force push!
3. Screenshot the error
4. Ask Dhanush (Team Lead) for help
5. Share the error message in team chat

---

**Happy Coding! 🚀**
