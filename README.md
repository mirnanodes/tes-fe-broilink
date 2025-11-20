# BroiLink Frontend

Frontend aplikasi untuk sistem manajemen farm berbasis IoT menggunakan React + Vite.

## Tech Stack

- React 19
- Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Lucide React (Icons)

## Quick Start

### Prerequisites
- Node.js 22 or higher
- npm

### Installation

1. Install dependencies
```bash
npm install
```

2. Setup environment
```bash
cp .env.example .env
```

3. Configure API URL in `.env`
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=BroiLink
```

4. Start development server
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Login.jsx
│   ├── Navbar*.jsx
│   └── Sidebar*.jsx
├── Pages/             # Page components
│   ├── AdminPage/
│   ├── OwnerPage/
│   ├── FarmPage/
│   └── LandingPage/
├── services/          # API services
│   └── apiService.js
├── assets/            # Static assets
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## User Roles & Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page

### Admin Routes
- `/dashboard-admin` - Admin dashboard
- `/manajemen-pengguna` - User management
- `/konfigurasi-kandang` - Farm configuration
- `/riwayat-laporan` - Report history

### Owner Routes
- `/dashboard-owner` - Owner dashboard
- `/monitoring` - Real-time monitoring
- `/diagram-analisis` - Data analysis
- `/profile-owner` - Owner profile

### Peternak Routes
- `/dashboard-farm` - Farm dashboard
- `/input-kerja-farm` - Daily input
- `/profile-farm` - Farm profile

## API Service Usage

```javascript
import apiService from './services/apiService';

// Login
const response = await apiService.auth.login({ username, password });

// Get data (authenticated)
const data = await apiService.owner.getDashboard();

// Post data
const result = await apiService.peternak.submitManualData(formData);
```

See [SETUP_GUIDE.md](../SETUP_GUIDE.md) for complete API documentation.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000/api |
| VITE_APP_NAME | Application name | BroiLink |

## Development Notes

- API service automatically handles authentication tokens
- Token stored in localStorage
- 401 responses automatically redirect to login
- CORS configured in backend for localhost:5173

## Building for Production

1. Update `.env` with production API URL
2. Build the project
```bash
npm run build
```
3. Deploy `dist/` folder to web server

## License

Proprietary
