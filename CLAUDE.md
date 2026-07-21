

    ### READ THIS
    This project is a commision work for my friends, we'll gonna making a SPA portofolio website that having 2 pages, home (the portofolio) and admin/cms content.

    ### FEATURES
    - Home page will be a SPA that will fetch data from API and display it in a nice way, the content is about my friends and their work.
    - There will be some features:
    - Login VIA google (whitelisted email on .env), NO USERNAME/PASS needed, just google account.
    - 

    ## Section
    1. Hero Section: There'll gonna displays a Greetings Message, and beside there'll be a photo of my friend
    2. About Section: THis gonna display my friend's bio or about himself, may contains short history, and what he can do
    3. Education Section: THis gonna display education history that can viewed as Timeline or Cards
    4. Experience Section: this gonna display my friend's experience which can included as Organizational experience or Working Experiences, it should be displayed with a Timeline Cards
    5. Skills Section: This will display his skills (problem solving, public speaking, critical thinking) and interests/talents (singing, sports) as listed in the CV.
    6. Achievements Section: This will display his competition history and awards (e.g., Lomba bernyanyi, paduan suara, dll) in a list or card format.
    7. Project Section: This gonna dislay my friend's project, it should be displayed with a Grid Cards that contains project image, title, and description, and when clicked, it will open a modal that contains more details about the project.
    8. Contact Section: This gonna display my friend's contact information, such as email, phone number, and social media links (Instagram, WhatsApp, LinkedIn placeholder). It should be displayed with a Contact Form and a QR Code for whatsapp, the contact form will be sent to my friend's email, and it will be displayed in a Modal when submitted

    ## Admin/CMS
    1. Manage Profile: Edit bio, interests, contact info, and upload CV.
    2. Manage Education: CRUD operations for education history.
    3. Manage Experience: CRUD operations for organizational/committee experience.
    4. Manage Achievements: CRUD operations for awards and competitions.
    5. Manage Skills: CRUD operations for skills and talents.
    6. Manage Projects: CRUD operations for projects (upload images, titles, descriptions).

    ## Design System
    - **Background**: Broken White / Off-white (e.g., `#F9F9F9` atau `#FDFCF8`) agar terasa hangat, tenang, ramah, dan tidak klinis.
    - **Primary**: `#005F73` (Dark Teal) - Simbol ketenangan, empati, dan profesionalisme (cocok untuk psikologi).
    - **Secondary**: `#0A9396` (Light Teal) - Aksen penenang.
    - **Tertiary**: `#7C4817` (Brown) - Kesan *grounded* dan membumi.
    - **Neutral**: `#747779` (Gray) - Teks sekunder.
    - **Typography**:
    - **Headline**: *Hanken Grotesk* (dari palet) atau *Lora* (serif, ngasih kesan akademis elegan).
    - **Body**: *Inter* (nyaman dibaca).
    - **UI Style**: Clean, banyak *whitespace*, *rounded corners* (sudut melengkung) di card/button biar kerasa *approachable* (nggak kaku). Hindari bayangan (shadow) yang terlalu tajam; pakai soft shadow.

    ## Strict Rules
    - **DO NOT execute any code or commands unless explicitly instructed.**
    - **NO EMOJIS in any communication, UI, or code.**


    ### schemadb

    Semua tabel menggunakan `portfolio_id` (varchar) untuk multi-tenant (ibnu, mentor, nofita).

    ```sql
    -- 1. profiles
    CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    full_name varchar NOT NULL,
    headline varchar,
    bio text,
    contact_email varchar,
    contact_phone varchar,
    instagram_url varchar,
    whatsapp_url varchar,
    linkedin_url varchar,
    cv_url varchar,
    avatar_url varchar
    );

    -- 2. education
    CREATE TABLE education (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    institution varchar NOT NULL,
    degree varchar,
    start_date date,
    end_date date, -- null = present
    description text
    );

    -- 3. experiences (Organisasi/Kepanitiaan/Kerja)
    CREATE TABLE experiences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    organization varchar NOT NULL,
    role varchar NOT NULL,
    start_date date,
    end_date date,
    description text
    );

    -- 4. skills (termasuk minat/bakat)
    CREATE TABLE skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    name varchar NOT NULL,
    category varchar -- e.g., 'soft_skill', 'talent'
    );

    -- 5. achievements (Prestasi/Lomba)
    CREATE TABLE achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    title varchar NOT NULL,
    year int,
    description text
    );

    -- 6. projects
    CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id varchar NOT NULL,
    title varchar NOT NULL,
    description text,
    image_url varchar,
    link_url varchar
    );
    ```