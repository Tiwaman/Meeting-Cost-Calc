# Workflow Processor Skill

This skill provides instructions on how to process a directory containing sequential workflow step files (e.g., `Step1.md`, `Step2.md`, etc.).

## Instructions

1. **Identify the Workflow Directory**: Locate the folder containing the step files (e.g., `Workflow/`).
2. **Sort the Steps**: List the files and sort them numerically/alphabetically to ensure they are applied in order.
3. **Process Each Step**:
   - For each step file:
     - Read the content of the step (Markdown).
     - Identify the required changes (UI, logic, animations, etc.).
     - Locate the target files in the codebase (`index.html`, `main.js`, `style.css`, etc.).
     - Apply the changes using `replace_file_content` or `multi_replace_file_content`.
     - **Verification**: After applying each step, perform a quick verification (e.g., run `npm run dev` and check the UI via `browser_subagent`) to ensure no regressions were introduced.
4. **Final Polish**: Once all steps are completed, do a final pass to ensure consistency and quality across the entire feature set.

## Best Practices
- **Atomic Commits/Saves**: Focus on one step at a time.
- **Micro-animations**: When requested, use CSS transitions/animations for a premium feel.
- **Copy**: Pay close attention to UX copy and reactions as defined in the steps.
