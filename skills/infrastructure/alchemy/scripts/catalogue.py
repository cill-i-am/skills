"""Lossless text encoding for the versioned catalogue inside Executor's skill cache."""
import json
import os
import re

KINDS = ("release guide", "release blog", "release example", "release export map",
         "release symbols", "website service reference")


def pack(row, revision):
    kind = row["kind"]
    url = row["url"]
    for view in ("blob", "tree"):
        base = f"https://github.com/alchemy-run/alchemy/{view}/{revision}/"
        if url.startswith(base):
            url = view + "/" + url[len(base):]
            break
    terms = row["terms"]
    if kind == "release symbols":
        names = []
        previous = ""
        for name in terms.split():
            count = len(os.path.commonprefix([previous, name]))
            # A leading colon escapes a literal token resembling a prefix length.
            if count > 4:
                token = f"{count}:{name[count:]}"
            elif name.startswith(":") or re.match(r"\d+:", name):
                token = ":" + name
            else:
                token = name
            names.append(token)
            previous = name
        terms = " ".join(names)
    return json.dumps([KINDS.index(kind), row["title"], url, terms],
                      separators=(",", ":"), ensure_ascii=False)


def unpack(line, revision):
    kind_id, title, url, terms = json.loads(line)
    kind = KINDS[kind_id]
    if url.startswith(("blob/", "tree/")):
        view, path = url.split("/", 1)
        url = f"https://github.com/alchemy-run/alchemy/{view}/{revision}/{path}"
    if kind == "release symbols":
        names = []
        for token in terms.split():
            match = re.match(r"^(\d+):(.*)$", token)
            if match:
                token = names[-1][:int(match[1])] + match[2]
            elif token.startswith(":"):
                token = token[1:]
            names.append(token)
        terms = " ".join(names)
    return {"kind": kind, "title": title, "url": url, "terms": terms}
