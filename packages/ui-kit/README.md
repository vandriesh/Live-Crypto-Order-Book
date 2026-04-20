# @neet/ui-kit

Purpose: hold domain-agnostic UI primitives and shadcn source components.

Scope:
- shadcn-generated original components
- shared UI helpers and utility functions
- no order-book or market-specific knowledge

Notes:
- future shadcn additions should target this package through `components.json`
- use `npm run shadcn:add -- <component>` so generated same-package imports are rewritten to relative paths
- the shadcn wrapper creates temporary internal aliases only during generation; runtime consumers should still import only from `@neet/ui-kit`
- feature packages should consume this package, not redefine generic UI primitives
