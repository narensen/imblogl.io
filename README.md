<img width="1898" height="931" alt="Screenshot from 2025-10-25 00-45-43" src="https://github.com/user-attachments/assets/60b72933-9f0f-450d-a8f9-d18c6354b730" />


---

## What it Does 📝

This platform allows for creating, reading, updating, and deleting blog posts. You can organize posts using categories, assigning multiple categories to a single post. The main blog page displays recently published posts, allows filtering by category, and provides individual pages for each post.

There's also a simple admin dashboard (`/admin/posts` and `/admin/categories`) where you can manage all content, including setting posts as "Draft" or "Published" and uploading featured images.

---

## Tech Stack 🛠️

* **Core:** Next.js 15 (App Router), TypeScript
* **Backend:** tRPC, PostgreSQL (hosted on Neon), Drizzle ORM, Zod (for validation)
* **Frontend:** React Query (via tRPC), Tailwind CSS, shadcn/ui, Sonner (for toasts)
* **Images:** Vercel Blob

---

## Getting Started Locally 🚀

1.  **Clone:** `git clone [INSERT YOUR GITHUB REPO LINK HERE]` and `cd` into the directory.
2.  **Install:** `npm install`
3.  **Database:** Set up a PostgreSQL database (e.g., on Neon).
4.  **Environment:** Create a `.env` file in the root and add your database connection string:
    ```env
    DATABASE_URL="postgres://user:password@host/dbname"
    BLOB_READ_WRITE_TOKEN="your_vercel_blob_token" # Get via 'vercel blob add'
    ```
5.  **Sync DB:** `npx drizzle-kit push:pg`
6.  **Run:** `npm run dev`
7.  Visit `http://localhost:3000`.

---

## A Few Notes 🤔

* **Simplicity:** Chose Markdown via a basic textarea and skipped complex features like search or pagination to focus on core requirements.
* **UI:** Leveraged `shadcn/ui` heavily for speed, aiming for a clean look similar to the provided sample.
* **Image Uploads:** Used Vercel Blob for straightforward integration.

---
