# Loot Box Store

A web-based e-commerce platform for purchasing curated boxes of snacks 
from different countries around the world. Built as part of a university 
software development project following agile development practices.

## Team

| Name                      | UiT ID    | Github username  |
|---------------------------|-----------|------------------|
| Alejandro Rodriguez Perez | alrod7901 | Alesato10        |
| Anders Sellæg Ellingsen   | anell8161 | Anderssellingsen |
| Andrea Cárdenas Mayoral   | ancar8714 | ancar8714        |
| Giang Hoang Nguyen        | gng000    | Giang-UIT        |
| Øystein Sellæg Ellingsen  | oel016    | Raspaballer      |

## Project structure

```
    ├── Backend/          # Django REST API and database
    │   ├── univ/         # Django project and app
    │   ├── docs/         # Lecture materials
    │   ├── requirements.txt
    │   ├── manage.py
    │   ├── schema.sql
    │   └── pop.sql       # Database population script
    ├── Frontend/         # Vue.js + Vuetify frontend
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── utils/
    │   │   └── api.ts
    │   └── package.json
    └── docs/             # Project documentation
        ├── meetings/
        ├── plannings/
        ├── retrospectives/
        ├── TA meetings/
        ├── ConfigManagement.md
        ├── Web_Design.md
        ├── Niko_Niko_calendar.md
        └── Story_points.md
```

## Requirements

- Python 3.10 or higher
- Node.js 18 or higher
- npm

## Setup and installation

### Backend

1. Create and activate a virtual environment:
```bash
python3 -m venv ~/.virtualenvs/lootbox
source ~/.virtualenvs/lootbox/bin/activate
```

2. Install dependencies:
```bash
cd Backend
pip install -r requirements.txt
```

3. Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. (Optional) Populate the database with sample data:
```bash
sqlite3 db.sqlite3 < pop.sql
```

5. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`.

### Frontend

1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Running the application

Both the backend and frontend servers must be running at the same time 
for the application to work. Open two terminals and run one in each.

## Testing

### Frontend

```bash
cd Frontend
npm run test:unit
```

### Backend

```bash
cd Backend
python manage.py test
```

## Documentation

All project documentation is in the `docs/` folder, including:

- Meeting notes — `docs/meetings/` and `docs/TA meetings/`
- Sprint planning poker — `docs/plannings/`
- Sprint retrospectives — `docs/retrospectives/`
- Web design and page flow — `docs/Web_Design.md`
- Configuration management guidelines — `docs/ConfigManagement.md`
- Niko niko calendar — `docs/Niko_Niko_calendar.md`
- Story points per sprint — `docs/Story_points.md`

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue.js 3, Vuetify, TypeScript |
| Backend | Django, Django REST Framework |
| Database | SQLite |
| Testing (frontend) | Vitest |
| Testing (backend) | Django test framework |
| Version control | GitHub |
| Project management | GitHub Projects, Jira |

## Acknowledgements

The backend structure is based on the Django template provided by 
Professor Weihai Yu through the course lecture videos.