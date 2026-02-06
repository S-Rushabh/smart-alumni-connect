# Database Sharing Guide

This guide explains how to share your local PostgreSQL database with your team and how they can import it.

## 1. Exporting the Database (For You)
To update the `shareable_dump.sql` file with the latest data from your local database:

1. Ensure your Docker containers are running:
   ```bash
   docker-compose up -d
   ```
2. Run the export command:
   **PowerShell:**
   ```powershell
   docker exec smart-alumni-connect-db-1 pg_dump -U admin alumni_db > shareable_dump.sql
   ```
   **CMD / Bash:**
   ```bash
   docker exec smart-alumni-connect-db-1 pg_dump -U admin alumni_db > shareable_dump.sql
   ```
3. Commit and push the updated `shareable_dump.sql` file to your repository found in the root directory.

---

## 2. Importing the Database (For Teammates)
To import the shared database into your local environment:

### Prerequisites
- Docker and Docker Compose installed.
- The project repository cloned locally.
- The containers running (`docker-compose up -d`).

### Import Steps
Run one of the following commands in your project root terminal:

**Option A: PowerShell (Recommended for Windows)**
```powershell
Get-Content shareable_dump.sql | docker exec -i smart-alumni-connect-db-1 psql -U admin alumni_db
```

**Option B: CMD / Bash / Mac / Linux**
```bash
docker exec -i smart-alumni-connect-db-1 psql -U admin alumni_db < shareable_dump.sql
```

> **Note:** This will OVERWRITE existing data in your local `alumni_db` database with the data from the dump file.

---

## 3. Troubleshooting

- **"Container not found"**: Run `docker ps` to verify the container name. If it's different from `smart-alumni-connect-db-1`, replace it in the commands above.
- **"Permission denied"**: Ensure you have write permissions in the directory when exporting.
- **Encoding issues**: If you see weird characters after import on Windows, try using the PowerShell `Get-Content` command (Option A) as it handles text encoding better than standard redirection `<`.
