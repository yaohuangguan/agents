import { build } from "esbuild";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("agents core bundle", () => {
  it("keeps MCP client runtime behind a dynamic import", async () => {
    const result = await build({
      entryPoints: [resolve("src/index.ts")],
      bundle: true,
      splitting: true,
      conditions: ["workerd", "browser", "import", "module"],
      external: ["cloudflare:*"],
      format: "esm",
      metafile: true,
      minify: true,
      outdir: "out",
      platform: "node",
      target: "es2021",
      write: false
    });

    const outputs = result.metafile!.outputs;
    const entry = Object.entries(outputs).find(([, output]) =>
      output.entryPoint?.endsWith("src/index.ts")
    );
    expect(entry).toBeDefined();

    const staticOutputs = new Set<string>();
    const visit = (outputPath: string) => {
      if (staticOutputs.has(outputPath)) return;
      staticOutputs.add(outputPath);
      const output = outputs[outputPath];
      if (!output) return;
      for (const dependency of output.imports) {
        if (dependency.kind === "import-statement") {
          visit(dependency.path);
        }
      }
    };
    visit(entry![0]);

    const staticInputs = [...staticOutputs]
      .flatMap((outputPath) => Object.keys(outputs[outputPath]?.inputs ?? {}))
      .join("\n");

    expect(staticInputs).not.toContain("@modelcontextprotocol/client");
    expect(staticInputs).not.toContain("@modelcontextprotocol/sdk/types");
    expect(staticInputs).not.toContain("src/mcp/client/connection.ts");
    expect(staticInputs).not.toContain("src/mcp/client/runtime.ts");

    const allInputs = Object.values(outputs)
      .flatMap((output) => Object.keys(output.inputs))
      .join("\n");
    expect(allInputs).toContain("src/mcp/client/connection.ts");
    expect(allInputs).toContain("src/mcp/client/runtime.ts");

    const dynamicImports = Object.values(outputs)
      .flatMap((output) => output.imports)
      .filter((dependency) => dependency.kind === "dynamic-import");

    expect(dynamicImports.length).toBeGreaterThan(0);
  });
});
