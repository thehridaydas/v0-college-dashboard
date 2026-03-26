import subprocess
import os

os.chdir("/vercel/share/v0-project")

result = subprocess.run(
    ["npx", "tsx", "prisma/seed.ts"],
    capture_output=True,
    text=True,
)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("Exit code:", result.returncode)
