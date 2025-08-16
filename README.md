# DeepGuard - AI Media Authentication

A modern web application for AI-powered deepfake detection and media authentication. Built with React, TypeScript, and Supabase.

## 🚀 Features

- **AI-Powered Analysis**: Advanced deepfake detection for images, videos, and audio
- **Multi-Format Support**: JPG, PNG, MP4, MOV, MP3, WAV files up to 100MB
- **Real-time Processing**: Live upload progress and analysis status tracking
- **Interactive Dashboard**: Comprehensive analytics with charts and statistics
- **Detailed Results**: Confidence scores, classifications, and heatmap overlays
- **PDF Reports**: Downloadable analysis reports with full metadata
- **User Management**: Secure authentication with profile customization
- **Responsive Design**: Mobile-first design with dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts for data visualization
- **State Management**: React hooks + Context API
- **Routing**: React Router v6
- **Notifications**: React Hot Toast + Sonner

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or bun
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd deepguard-media-shield
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update the environment variables in `src/integrations/supabase/client.ts`

### 4. Run Database Migrations

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### 5. Set Up Storage Buckets

The migrations will automatically create:
- `media-files` bucket for uploaded media (100MB limit)
- `avatars` bucket for user profile pictures (5MB limit)

### 6. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🗄️ Database Schema

### Core Tables

- **`profiles`**: User profile information
- **`media_files`**: Uploaded media files and metadata
- **`analysis_results`**: AI analysis results and confidence scores
- **`user_feedback`**: User ratings and feedback on results
- **`user_preferences`**: User settings and preferences

### Key Relationships

- Users can upload multiple media files
- Each media file has one analysis result
- Users can provide feedback on analysis results
- User preferences are stored separately for customization

## 🔐 Authentication

DeepGuard uses Supabase Auth with:
- Email/password authentication
- Google OAuth (configurable)
- Row-level security (RLS) policies
- Protected routes for authenticated users

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Navigation.tsx  # Main navigation
│   └── ProtectedRoute.tsx # Auth guard
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication logic
│   └── use-toast.ts    # Toast notifications
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
│   ├── mediaService.ts # Media upload and analysis
│   └── utils.ts        # Helper functions
├── pages/              # Application pages
│   ├── Landing.tsx     # Home page
│   ├── Auth.tsx        # Login/signup
│   ├── Dashboard.tsx   # Analytics dashboard
│   ├── Upload.tsx      # File upload
│   ├── Results.tsx     # Analysis results
│   ├── Profile.tsx     # User settings
│   └── Help.tsx        # Help and FAQ
└── App.tsx             # Main application component
```

## 🎨 Customization

### Themes

The application supports:
- Light theme
- Dark theme  
- System preference detection
- High contrast mode

### Styling

- Built with Tailwind CSS
- Custom color schemes in `tailwind.config.ts`
- Glassmorphism effects and gradients
- Responsive breakpoints for all devices

## 📊 API Endpoints

### Media Operations

- `POST /media_files` - Upload new media file
- `GET /media_files` - Get user's media files
- `DELETE /media_files/:id` - Delete media file

### Analysis

- `POST /analysis_results` - Create analysis result
- `GET /analysis_results/:id` - Get analysis result
- `GET /analysis_results` - Get user's analysis results

### User Management

- `GET /profiles/:id` - Get user profile
- `PUT /profiles/:id` - Update user profile
- `GET /user_preferences/:id` - Get user preferences
- `PUT /user_preferences/:id` - Update user preferences

## 🔒 Security Features

- Row-level security (RLS) on all tables
- User authentication required for protected routes
- File upload validation and sanitization
- Secure file storage with access controls
- Automatic cleanup of temporary files

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the Help page in the application
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@deepguard.ai
- **Discord**: Join our community server

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Recharts](https://recharts.org) for data visualization
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---

Built with ❤️ by the DeepGuard team
