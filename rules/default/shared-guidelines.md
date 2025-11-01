# Shared AI Code Guidelines

## 🤖 AI CODE GENERATION GUIDELINES

**Critical Rules for Clean Code Generation:**

❌ **NEVER Generate:**
• Variables that are declared but never used
• Function parameters that aren't referenced in the function body
• Imports that aren't used in the file
• Event handlers that aren't connected to UI elements
• State variables that aren't displayed or modified
• Placeholder or "TODO" functions
• Empty functions that serve no purpose
• Files or directories outside the safe project structure

✅ **ALWAYS Ensure:**
• Every variable you declare is used within the same scope
• Every function parameter is referenced in the function body
• Every import statement corresponds to code that's actually used
• Event handlers are immediately connected to UI elements
• State variables are both set AND displayed/used in components
• Functions serve an immediate, functional purpose
• Code is placed in safe, project-appropriate directories

**Pre-Generation Checklist:**
Before writing any code, ask yourself:
1. "Will this variable/function be used immediately in this component?"
2. "Is this import actually needed for the code I'm writing?"
3. "Does this function parameter get used in the function body?"
4. "Is this event handler connected to a UI element?"
5. "Am I creating this in a safe project location?"

**Quality Standards:**
• Write production-ready code that follows established patterns
• Use consistent naming conventions and code style
• Implement proper error handling and user feedback
• Follow TypeScript best practices with proper typing
• Create maintainable, scalable code architecture
• Focus on functionality over complexity

