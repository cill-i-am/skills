# Find an Alchemy API or pattern

Start with the importing package's lockfile and exports. For beta.87, the [catalogue manifest](source-index.json) lists small shards named by topic. When reading the skill through Executor, open the relevant shard with the skill file reader. In a local checkout run:

```sh
python3 scripts/find-reference.py Resource.lookup
python3 scripts/find-reference.py Alchemist
python3 scripts/find-reference.py worktrees
python3 scripts/find-reference.py aws website nextjs
```

The catalogue includes the tagged guide sections, release blogs, official example directories, public package export maps, exact exported symbol names grouped by service and the generated service pages from the website. Guide, example and manifest results link to immutable release source. A service reference describes the live website: check the resource or binding in the installed provider before copying its signature. The manifest records availability exceptions.

For a deep API, open the service's public export map and follow its barrel to the implementation, binding, props, lifecycle or test. For a framework, search the exact host/framework example before assuming parity. The same workload can have different routing, caching, identity or storage semantics on another host.

[Agent docs index](https://alchemy.run/llms.txt) · [Service catalogue](https://alchemy.run/llms-full.txt) · [Tagged examples](https://github.com/alchemy-run/alchemy/tree/v2.0.0-beta.87/examples) · [Integration tests](https://github.com/alchemy-run/alchemy/tree/v2.0.0-beta.87/packages/integration-tests/test)
