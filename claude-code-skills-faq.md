# Claude Code Skills - Frequently Asked Questions

---

## General Questions

- **Question**: What are Claude Code Skills?
- **Answer**: Skills are specialized capabilities that extend Claude Code's functionality for specific tasks like document creation, design, testing, and development workflows. They provide domain expertise and tooling beyond Claude's base capabilities.

---

- **Question**: How do I use a Skill in Claude Code?
- **Answer**: Simply ask Claude to perform a task that matches a skill's domain, or explicitly request a skill by name. Claude will automatically invoke the appropriate skill and follow its specialized instructions.

---

- **Question**: Where do Skills come from?
- **Answer**: Skills are available from the Anthropic Marketplace (pre-built by Anthropic) or can be user-defined in your local `.claude/` configuration directory.

---

## Document Skills

- **Question**: What document formats can Claude Code work with using Skills?
- **Answer**: Claude Code supports Excel spreadsheets (.xlsx), Word documents (.docx), PowerPoint presentations (.pptx), and PDF files through dedicated document skills.

---

- **Question**: Can Claude Code create spreadsheets with formulas?
- **Answer**: Yes, the `document-skills:xlsx` skill supports creating spreadsheets with formulas, formatting, data analysis, and visualization capabilities.

---

- **Question**: Can Claude Code fill out PDF forms?
- **Answer**: Yes, the `document-skills:pdf` skill can fill PDF forms, extract text and tables, create new PDFs, and merge or split existing documents.

---

## Creative & Design Skills

- **Question**: Can Claude Code create visual designs and artwork?
- **Answer**: Yes, the `canvas-design` skill creates posters, visual art, and designs in PNG/PDF format, while `algorithmic-art` generates code-based generative art using p5.js.

---

- **Question**: Can Claude Code make animated GIFs?
- **Answer**: Yes, the `slack-gif-creator` skill creates animated GIFs optimized for Slack, with validators for size constraints and composable animation primitives.

---

## Development Skills

- **Question**: Can Claude Code help me build my own Skills?
- **Answer**: Yes, the `skill-creator` skill provides guidance for creating effective custom skills that extend Claude's capabilities with specialized knowledge and workflows.

---

- **Question**: What is the `mcp-builder` skill for?
- **Answer**: The `mcp-builder` skill helps you create MCP (Model Context Protocol) servers that enable Claude to interact with external services through well-designed tools, supporting both Python (FastMCP) and Node/TypeScript.

---

- **Question**: Can Claude Code test web applications?
- **Answer**: Yes, the `webapp-testing` skill uses Playwright to interact with and test local web applications, supporting UI verification, screenshot capture, and browser log viewing.

---

## Theming & Branding Skills

- **Question**: Can I apply consistent styling to documents Claude creates?
- **Answer**: Yes, the `theme-factory` skill offers 10 pre-set themes or can generate custom themes on-the-fly for slides, docs, reports, and HTML pages.

---

- **Question**: Does Anthropic have brand guidelines available as a skill?
- **Answer**: Yes, the `brand-guidelines` skill applies Anthropic's official brand colors and typography to artifacts that benefit from Anthropic's look-and-feel.

---

## Custom Skills

- **Question**: Can I create my own custom Skills?
- **Answer**: Yes, you can define custom skills in your `.claude/` directory. Use the `skill-creator` skill for guidance on structure, prompts, and best practices.

---

- **Question**: How do I share Skills with my team?
- **Answer**: Skills can be checked into your project's `.claude/` directory or shared via your organization's plugin marketplace configuration.

---

## Availability & Access

- **Question**: Are all Skills available to all Claude Code users?
- **Answer**: Marketplace skills from Anthropic are generally available to Claude Code users. Some skills may require specific plugins or configurations to be enabled.

---

- **Question**: How do I see what Skills are currently available?
- **Answer**: Ask Claude Code "What skills are available?" and it will list all loaded skills from both the Anthropic marketplace and any user-defined configurations.

---

*Last Updated: December 2024*
