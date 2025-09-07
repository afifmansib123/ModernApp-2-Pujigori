# PujiGori FrontEnd Implementation Guide

## 🎯 Notes 

### Chapter1 : Initial Project Setup (3.1 to 3.3 commits)

**Tailwind Shandcn and UI related**

1. dragged the resources folder to make life easy.
2. install dependencies : npm i lucide-react dotenv date-fns react-filepond filepond filepond-plugin-image-exif-orientation filepond-plugin-image-preview framer-motion mapbox-gl lodash react-hook-form zod @hookform/resolvers
3. install tailwind : npm install -D tailwindcss@^3 postcss autoprefixer npx tailwindcss init -p 
4. initiate tailwind : npx tailwindcss init -p
5. dragged files : global.css to app folder , tailwind.config.ts and tsconfig.json to root. deleted tailwind.config.js.
6. install shadcn components : npx shadcn@latest add avatar badge button card checkbox command dialog dropdown-menu form input label navigation-menu radio-group select separator sheet sidebar skeleton slider switch table tabs textarea tooltip
7. copied the constants to lib folder. 


### Chapter2 : RTK (Commit 3.4)

1. install : npm install @reduxjs/toolkit react-redux
2. copied the state folder -> has all redux toolkit files. 
3. wrote the providers file in src and wrapped layout in that.
4. NEXT_PUBLIC_API_BASE_URL = localhost,nodejs address.

### Chapter3 : UI (UI Setup)

1. Created nondashboard landing page and layouts. (commit 4.1)
2. created The Navbar , Copied Code , put it in landing page. (commit 4.1)
3. framer motion install -> npm install framer-motion (Commit 4.2)
4. made - HeroSection , FeatureSection and CalltoActionSection (Commit 4.2)
5. instlled fontawesome for footer and copied footer. -> npm i @fortawesome/fontawesome-svg-core @fortawesome/free-brands-svg-icons @fortawesome/react-fontawesome --legacy-peer-deps (Commit 4.2)


