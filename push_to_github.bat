@echo off
git add -A
git commit -m "Remove temp batch file"
git remote add origin https://github.com/luonghaianh1208/edugame-ai.git
git branch -M main
git push -u origin main
