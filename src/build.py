import pathlib

S = pathlib.Path(__file__).parent
css = (S / "styles.css").read_text(encoding="utf8")
files = ["core.js", "graph.js", "gen1.js", "gen2.js", "gen3.js", "gen4.js", "concepts.js", "mock.js", "pearson-gen.js", "pearson-gen2.js", "tables.js", "pearson-ui.js", "analytics.js", "app.js"]
js = "\n;\n".join((S / f).read_text(encoding="utf8") for f in files).replace("</script", "<\\/script")
shell = (S / "shell.html").read_text(encoding="utf8")
frag = shell.replace("/*CSS*/", css, 1).replace("/*JS*/", js, 1)

head, body = frag.split("<!--BODY-->", 1)
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        + head + "</head>\n<body>\n" + body + "\n</body>\n</html>\n")

if S.name == "src":
    # inside the git repo: build index.html at the repo root
    (S.parent / "index.html").write_text(full, encoding="utf8")
    print("built index.html")
else:
    pub = S.parent / "publish"
    pub.mkdir(exist_ok=True)
    (pub / "mat213-midterm-lab.html").write_text(frag, encoding="utf8")
    desk = pathlib.Path(r"C:\Users\mleet\Desktop\mat 2026\03 Exam Prep")
    desk.mkdir(parents=True, exist_ok=True)
    (desk / "MAT 213 Midterm Lab.html").write_text(full, encoding="utf8")
    print("built", len(frag), "bytes")
