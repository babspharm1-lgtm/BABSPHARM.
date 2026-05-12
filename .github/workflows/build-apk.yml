name: Split index-1.html
on: workflow_dispatch
jobs:
  split:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run script
        run: python3 .github/split.py
      - name: Commit changes
        run: |
          git config user.email "action@github.com"
          git config user.name "GitHub Action"
          git add index-1.html
          git commit -m "Add Supabase script tag"
          git push
