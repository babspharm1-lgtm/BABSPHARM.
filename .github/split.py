with open("index-1.html", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

old = '<script src="app.js"></script>'
new = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n<script src="app.js"></script>'

content = content.replace(old, new, 1)

with open("index-1.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")
