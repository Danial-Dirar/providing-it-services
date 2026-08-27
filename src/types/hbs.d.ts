/**
 * `hbs` ships no types and uses a CommonJS single-object export. We only touch
 * a few functions on it, so a narrow declaration is more honest than `any`.
 */
declare module 'hbs' {
  interface Hbs {
    registerPartials(dir: string, callback?: () => void): void;
    registerHelper(name: string, fn: (...args: never[]) => unknown): void;
    registerPartial(name: string, source: string): void;
    handlebars: unknown;
  }
  const hbs: Hbs;
  export = hbs;
}
