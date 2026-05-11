import os, re

with open("index-1.html", "r", encoding="utf-8") as f:
    content = f.read()

os.makedirs("split-output", exist_ok=True)

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css = css_match.group(1) if css_match else ""

# Extract JS
js_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
js = js_match.group(1) if js_match else ""

# Replace in HTML
html = content
html = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="style.css">', html, flags=re.DOTALL)
html = re.sub(r'<script>.*?</script>', '<script src="app.js"></script>', html, flags=re.DOTALL)

with open("split-output/style.css", "w") as f:
    f.write(css)
with open("split-output/app.js", "w") as f:
    f.write(js)
with open("split-output/index-1.html", "w") as f:
    f.write(html)

print("Done! Files saved to split-output/")
