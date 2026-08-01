# eepsmedia plugins have moved

These plugins moved to <https://github.com/concord-consortium/eepsmedia> on 2026-07-31 (CODAP-1423).

They are no longer built or deployed from this repo — the new repo deploys them directly to
`s3://codap-resources/plugins/eepsmedia/` via per-plugin git tags. **Do not re-add plugin code
here.** Earlier history is preserved in this repo's git log and in the new repo.

Affected plugins: Choosy, scrambler, simmer, testimate (deployed), plus norma and lotti (present in
the new repo but never deployed).

## Notes for anyone touching the CODAP V2 build

The plugins are still listed in `published-plugins.json`, and their entries remain in
`src/data_interactive_map.json`. That is deliberate: those files describe what a CODAP V2 build
*should* contain, and V2 serves plugins from folders co-located with the built application rather
than from S3. Removing them would silently drop the plugins from a future V2 build's menu, which is
why it was not done.

`bin/build` no longer copies these folders, so **a V2 build requires manual intervention** — it will
otherwise ship a plugin menu with four entries that 404. `bin/build` prints instructions at the end
of every run, and the `codap-v2-build` skill in the codap repo covers it at Phase 3, Step 8.

**Recommended: copy on the server, after deploy.** This is the same fallback the skill already uses
for any plugin that fails to build, and it avoids the timing hazard below:

```bash
ssh codap-server.concord.org \
  "sudo cp -r /var/www/html/releases/build_PREV/extn/plugins/eepsmedia \
              /var/www/html/releases/build_NEW/extn/plugins/eepsmedia"
```

**Alternative: copy locally**, into `<build>/extn/plugins/eepsmedia/` — but only *after*
`codap/bin/makeExtn` finishes and *before* the zip is sealed. Neither earlier destination survives:
`makeExtn` rsyncs into `extn/plugins` with `--delete`, removing anything pre-placed there, and
`bin/build` does `rm -rf` on its working directory, so pre-placing into `target/build/plugins` is
wiped too. The call chain is `codap/bin/makeCodapZip` → `codap/bin/makeExtn` →
`codap-data-interactives/bin/build`.

Either way the source is the previous build or `s3://codap-resources/plugins/eepsmedia/`, and the
layout mirrors the eepsmedia repo root:

```
extn/plugins/eepsmedia/common/
extn/plugins/eepsmedia/plugins/{Choosy,scrambler,simmer,testimate}/
```

Note the capital C in `Choosy` — it is case-sensitive on Linux.

> ⚠️ **Before any V2-build → S3 sync.** Syncing a build's `extn/plugins/` to
> `s3://codap-resources/plugins/` **with `--delete`** would see `plugins/eepsmedia/` as an orphan
> and delete the live plugins, which are no longer produced by the V2 build but are still served
> from that bucket. Sync per-plugin rather than the whole `plugins/` prefix. Note that `--exclude`
> does *not* protect keys from `--delete` — it strands them; see `docs/deploying.md` in the
> eepsmedia repo.
