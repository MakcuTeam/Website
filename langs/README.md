# Language Configuration

This folder contains all language configurations and translations for the website.

## Adding a New Language

To add a new language, follow these steps:

### 1. Create Language Configuration File

Create a new JSON file named `[language-code].json` (e.g., `fr.json` for French, `es.json` for Spanish).

Example structure:
```json
{
  "code": "fr",
  "name": "French",
  "nativeName": "Français",
  "flag": "🇫🇷",
  "browserCodes": ["fr", "fr-FR", "fr-CA", "fr-BE"]
}
```

**Fields:**
- `code`: The language code used in URLs (e.g., "fr", "es", "de")
- `name`: English name of the language
- `nativeName`: Native name of the language
- `flag`: Emoji flag for the language
- `browserCodes`: Array of browser language codes that should map to this language (used for auto-detection)

### 2. Create Dictionary File

Create a dictionary file named `[language-code].dict.json` containing all translations.

You can copy `en.dict.json` as a template and translate all the values.

Example:
```json
{
  "metadata": {
    "title": "Makcu Officiel",
    "description": "Expériencez un contrôle fluide de la souris et du clavier avec MAKCU, la nouvelle génération."
  },
  "home": {
    "main_header": "Expériencez la sécurité et la vitesse de la nouvelle génération.",
    "read_guide": "Lire le guide",
    "name": "Makcu"
  },
  ...
}
```

### 3. That's It!

The website will automatically:
- Discover the new language on server startup
- Add it to the language switcher
- Enable browser language detection for users with matching browser settings
- Make it available in all routes

## File Structure

```
langs/
├── README.md           # This file
├── en.json             # English configuration
├── en.dict.json        # English translations
├── cn.json             # Chinese configuration
├── cn.dict.json        # Chinese translations
└── [new-lang].json     # Your new language config
└── [new-lang].dict.json # Your new language translations
```

## Browser Language Detection

The `browserCodes` array in the config file determines which browser language codes will automatically redirect to this language. For example:

- `["fr", "fr-FR", "fr-CA"]` will match users with French, French (France), or French (Canada) browser settings
- `["zh", "zh-CN", "zh-TW"]` will match users with Chinese browser settings

## Notes

- Language codes should be lowercase and 2-3 characters (e.g., "en", "cn", "fr", "es")
- Dictionary files must match the structure of `en.dict.json`
- All keys in the dictionary must be present (you can leave English text as fallback if needed)
- The website will default to English if a translation key is missing

