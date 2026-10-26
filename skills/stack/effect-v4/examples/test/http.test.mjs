import test from "node:test"
import assert from "node:assert/strict"
import { makeWebApi } from "../dist/http-api.js"

test("Fetch-style API serves a schema-defined health response", { timeout: 5_000 }, async () => {
  const api = makeWebApi()
  try {
    const response = await api.handler(new Request("http://localhost/health"))
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: "ok" })
  } finally {
    await api.dispose()
  }
})

test("Fetch-style API returns not found for an unknown route", { timeout: 5_000 }, async () => {
  const api = makeWebApi()
  try {
    const response = await api.handler(new Request("http://localhost/missing"))
    assert.equal(response.status, 404)
    await response.arrayBuffer()
  } finally {
    await api.dispose()
  }
})
