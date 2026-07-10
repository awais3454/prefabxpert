# Prijsconfiguratie / Pricing Configuration

## ⚠️ How to change prices

Edit this file in the source code:
```
src/components/WindowConfigurator/utils/pricing-config.json
```
Open it in any text editor (Notepad, VS Code), change the values, save.
Then rebuild the project:
```
npm run build
```

---

## Price Fields

| Field | Description | Default |
|-------|-------------|---------|
| `shutterPrice` | Roller shutter price per window (€) | 600 |
| `insectScreenPrice` | Insect screen price per window (€) | 165 |
| `ventGrillPrice` | Ventilation grille price per window (€) | 205 |
| `ventBicolorPrice` | Bi-color ventilation grille price per window (€) | 245 |
| `trimPrice` | Trim/afwerking price per window (€) | 85 |
| `screenlinePrice` | Screenline price per window (€) | 749 |
| `externalScreensPrice` | External screens price per window (€) | 600 |
| `wasteFeePrice` | Waste removal fee per meter width (€/m) | 140 |
| `aircoPrice` | Airco preparation price per window (€) | 2995 |
| `zonwerendGlasPrice` | Solar control glass price per glass pane (€) | 150 |
| `glasroedenPrice` | Decorative glass bars price per glass pane (€) | 125 |
| `pitchSlope28_37` | Roof slope surcharge per degree (28°–37°) (€/degree) | 99 |
| `pitchSlope20_28` | Roof slope surcharge per degree (20°–28°) (€/degree) | 150 |
| `coloredFramePrice` | Colored frame (RAL/Wood finish) per frame (€) | 250 |
| `kaderPremium` | Kader style premium (€) | 150 |

---

## Dormer Size Base Prices

The base price is determined by the total dormer width. These are defined directly in:

```
src/components/WindowConfigurator/utils/pricing.ts
```

Look for the `DORMER_SIZE_PRICES` array:

```ts
const DORMER_SIZE_PRICES = [
  { width: 2500,  price: 5770  },
  { width: 3000,  price: 5945  },
  { width: 3500,  price: 7190  },
  { width: 4000,  price: 8190  },
  { width: 4500,  price: 8790  },
  { width: 5000,  price: 9590  },
  { width: 5500,  price: 10190 },
  { width: 6000,  price: 10790 },
  { width: 6500,  price: 11590 },
  { width: 7000,  price: 12590 },
];
```

Prices between widths are **automatically interpolated**.

---

## How to Edit

1. Open `src/components/WindowConfigurator/utils/pricing-config.json`
2. Change any value (numbers only, no currency symbols)
3. Save the file
4. Run `npm run build` to rebuild

All prices are in **euros (€)** and are **including VAT**.
