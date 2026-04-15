# PDF Template

Zero-server PDF template engine with URL-encoded distribution. Create, share, and fill PDF templates entirely in the browser.

**Live demo:** [mianala.github.io/pdf-template](https://mianala.github.io/pdf-template/)

> Reference implementation for: *"The Code Revolution: How LLM-Driven Code Generation Is Democratizing Document Template Creation"* — Randriamanasina Mianala Loharano, University of Toamasina, April 2026.

## Features

- **Browser-native PDF generation** — React-PDF components transpiled at runtime via Babel Standalone. No server, no build step required.
- **Variable binding** — Mark fillable fields with `$("Field Name")` syntax. The system auto-extracts variables and generates input forms.
- **URL-encoded sharing** — Templates are serialized and compressed into the URL fragment. Share via link, QR code, email, or messaging. Recipients fill fields and download the PDF without any software installation.
- **Zero infrastructure** — Deploys as a static site on Vercel, Netlify, or GitHub Pages. No database, no API, no server-side rendering.
- **Privacy by design** — All data stays in the browser. Filled data never leaves the client.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and start editing the template.

## How It Works

### 1. Write a Template

Templates are React-PDF JSX components. Use `$("Variable Name")` to mark dynamic fields:

```jsx
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{$("Document Title")}</Text>
      <Text>Issued to: {$("Recipient Name")}</Text>
      <Text>Date: {$("Date")}</Text>
    </Page>
  </Document>
);
```

### 2. Fill Variables

The system extracts all `$("...")` patterns and generates a form. Users fill in values and see a live PDF preview.

### 3. Share via URL

Click **Share URL** to serialize the entire template into a compressed URL. Anyone with the link can fill and download the PDF — no account, no server, no installation.

### 4. Download PDF

Click **Download PDF** to generate and save the document locally.

## Architecture

```
User prompt -> LLM generates React-PDF code -> Babel Standalone transpiles in-browser
    -> Variable extraction via regex -> Form generation -> PDF rendering -> URL serialization
```

Key components (Section 3 of the paper):

| Component | Implementation |
|---|---|
| Transpilation | `@babel/standalone` runtime JSX to JS |
| PDF Rendering | `@react-pdf/renderer` client-side |
| Variable Binding | `$("name")` regex extraction + resolver function |
| Distribution | LZ-string compressed URL fragment |
| Hosting | Static site (Vercel/Netlify free tier) |

## Variable Syntax

Two syntaxes are supported:

```jsx
// Function-call syntax (recommended)
<Text>{$("Applicant Name")}</Text>

// Template-literal syntax (per paper grammar)
<Text>{`Permit for ${`applicantName`}`}</Text>
```

### Grammar (Section 3.2)

```
TextContent  ::= (StaticText | VariableExpr)*
VariableExpr ::= '$("' Identifier '")' | '${`' Identifier '`}'
Identifier   ::= [a-zA-Z_\s][a-zA-Z0-9_\s]*
StaticText   ::= <chars not containing variable patterns>
```

## Deployment

Build and deploy as a static site:

```bash
npm run build
# Output in dist/ — deploy to any static host
```

Deploy to Vercel:

```bash
npx vercel
```

## Cost Model (from paper Section 3.5)

| Scenario | Setup | Annual |
|---|---|---|
| Dedicated server | $20,000 | $2,400/yr |
| Enterprise platform | -- | $500-$60,000/yr |
| **PDF Template (this)** | **$0** | **$0** |

## Tech Stack

- [React-PDF](https://react-pdf.org/) — PDF rendering with React components
- [Babel Standalone](https://babeljs.io/docs/babel-standalone) — In-browser JSX transpilation
- [LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html) — URL-safe compression
- [CodeMirror](https://codemirror.net/) — Code editor with JSX syntax highlighting
- [Vite](https://vite.dev/) — Build tool

## License

MIT

## Citation

```bibtex
@article{randriamanasina2026code,
  title={The Code Revolution: How LLM-Driven Code Generation Is Democratizing Document Template Creation},
  author={Randriamanasina, Mianala Loharano},
  institution={Department of Artificial Intelligence, University of Toamasina},
  year={2026},
  month={April}
}
```
