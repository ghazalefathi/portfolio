# Changelog

## Unreleased

- Fix the admin page freezing when focusing an input by rendering the application inside the document body instead of nesting a second HTML document.
- Add an optional `video_url` column to projects and use the generated database type in the admin editor.
- Replace per-image text fields with section-level descriptions for Gallery and Additional Screens in the admin dashboard and public project details page.
- Update public project gallery layout to a 4:3 aspect ratio with full image contain fitting (`object-contain`).
- Add `release_url`, `gallery_desc_fa/en`, and `extra_desc_fa/en` schema columns and database types.
