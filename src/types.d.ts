declare module "@babel/standalone" {
  export function transform(
    code: string,
    options: { presets?: string[]; filename?: string }
  ): { code: string };
  export default { transform };
}

declare module "lz-string" {
  export function compressToEncodedURIComponent(input: string): string;
  export function decompressFromEncodedURIComponent(
    input: string
  ): string | null;
  const LZString: {
    compressToEncodedURIComponent: typeof compressToEncodedURIComponent;
    decompressFromEncodedURIComponent: typeof decompressFromEncodedURIComponent;
  };
  export default LZString;
}
