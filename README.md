# Aatmaj Salunke · Portfolio

My personal site: **https://aatmaj28.github.io/Portfolio/**

It covers my work in LLM systems, RAG pipelines and AI evaluation, plus my experience, projects, publications and awards.

## What's on the site

| Section | What it shows |
|---|---|
| Home | Name, what I work on, links, quick stats |
| About | Short bio (an open book card) and a CV download |
| Education | MS in AI at Northeastern, B.Tech at Manipal University Jaipur |
| Experience | Roles and internships, current ones first |
| Projects | Hackathon, course and side projects with GitHub and live demo links |
| Publications | Published papers plus a row of papers under review, with an OpenReview link |
| Awards | Leadership roles, awards and talks |
| Skills | Tools grouped by AI/ML, languages, backend, cloud and data science |
| Contact | Contact details and a message form |

It works on phones and desktops, and has a light and dark theme that follows your system setting until you pick one.

## How it's built

A plain static site with no build step:

- `index.html` holds all the content
- `style.css` holds the styles and the light and dark theme colors
- `script.js` runs the carousels, typing effect, scroll reveals and hero effects
- `images/` holds logos and project images
- `Aatmaj_Salunke_Resume.pdf` is the CV behind the Download CV button

Libraries come from CDNs: jQuery, Owl Carousel, Typed.js, Font Awesome 5, Google Fonts (Sora, Space Grotesk, Inter) and EmailJS for the contact form.

## Updating content

Everything is plain HTML in `index.html`. To add an entry, copy an existing card in the right section and edit it. The carousels pick up new cards on their own.

When you add or remove entries, also update the hero stats near the top of `index.html` (both `data-count` and the number shown).

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploying

GitHub Pages serves the `main` branch from the repo root. Anything pushed to `main` goes live within a minute or two, so do work on a branch and merge when it's ready.

## Contact

- Email: [aatmajsalunke@yahoo.com](mailto:aatmajsalunke@yahoo.com)
- LinkedIn: [Aatmaj Salunke](https://www.linkedin.com/in/aatmaj-salunke-7106041b0/)
- GitHub: [@aatmaj28](https://github.com/aatmaj28)

## License

MIT, see [LICENSE](LICENSE).
