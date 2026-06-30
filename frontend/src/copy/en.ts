// ponytail: i18next upgrade path — replace the `en` const + `t()` body with
// `import i18n from 'i18next'; export const t = i18n.t.bind(i18n)` keeping all
// key strings and {{var}} syntax unchanged (they are i18next-native by design).

export const en = {
  form: {
    charLimit: {
      approaching: "{{remaining}} characters remaining",
      reached: "{{max}}-character limit reached",
    },
  },
  praxis: {
    charLimit: {
      approaching: "{{remaining}} characters left — make them count",
      terminal: "{{max}} characters — your proof is complete. No more words.",
    },
  },
  vote: {
    ephemerists: {
      apocryphal: "apocryphal",
      disputed: "disputed",
      plausible: "plausible",
      corroborated: "corroborated",
      canonical: "canonical",
    },
    everymen: {
      "a-start": "a start",
      solid: "solid",
      good: "good",
      excellent: "excellent",
      legendary: "legendary",
    },
    wow: {
      "a-start": "a start",
      solid: "solid",
      good: "good",
      excellent: "excellent",
      legendary: "legendary",
    },
    snide: {
      meh: "meh",
      "not-bad": "not bad",
      rad: "rad",
      sick: "sick",
      anarchy: "ANARCHY",
    },
    singularity: {
      noise: "NOISE",
      weak: "WEAK",
      signal: "SIGNAL",
      clear: "CLEAR",
      verified: "VERIFIED",
    },
    ua: {
      noted: "Noted",
      sketch: "Sketch",
      hung: "Hung",
      commended: "Commended",
      acquired: "Acquired",
    },
  },
} as const

type DotPaths<T, P extends string = ''> = T extends string
  ? P
  : {
      [K in keyof T & string]: DotPaths<
        T[K],
        P extends '' ? K : `${P}.${K}`
      >
    }[keyof T & string]

export type CatalogKey = DotPaths<typeof en>

export function t(key: CatalogKey, vars?: Record<string, string | number>): string {
  const parts = (key as string).split('.')
  let node: unknown = en
  for (const part of parts) {
    if (typeof node !== 'object' || node === null) {
      throw new Error(`[t] missing catalog key: "${key}"`)
    }
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node !== 'string') {
    throw new Error(`[t] missing catalog key: "${key}"`)
  }
  if (!vars) return node
  return node.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return String(vars[name])
    throw new Error(`[t] missing interpolation var "{{${name}}}" for key "${key}"`)
  })
}
