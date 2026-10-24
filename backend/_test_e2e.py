"""End-to-end test of the full DEDUCE flow with the new A.C.I.D. frontend."""
import httpx

BASE = "http://localhost:8000"
T = httpx.Timeout(180.0)

def check(name, cond, extra=""):
    print(("PASS" if cond else "FAIL"), name, extra)
    if not cond:
        raise SystemExit(1)

# --- Frontend assets ---
for path in ["/", "/static/style.css", "/static/app.js", "/static/acid-detective.png"]:
    r = httpx.get(BASE + path)
    check(f"frontend {path}", r.status_code == 200, f"({len(r.content)} bytes)")

# --- Create case ---
r = httpx.post(f"{BASE}/api/cases", json={"title": "E2E Test Case", "description": "Testing the new frontend"}, timeout=T)
check("create case", r.status_code == 201)
cid = r.json()["id"]

# --- Add evidence ---
evidence = [
    {"type": "witness", "source_label": "Sara", "text": "I saw John leave at 6pm Friday."},
    {"type": "log", "source_label": "Badge system", "text": "John badged IN at 8:14pm Friday."},
    {"type": "email", "source_label": "John", "text": "John emailed at 5:40pm saying he works from home."},
    {"type": "cctv", "source_label": "Lobby cam", "text": "Hoodie person exiting at 8:47pm."},
]
for e in evidence:
    r = httpx.post(f"{BASE}/api/cases/{cid}/evidence", json=e, timeout=T)
    check(f"add evidence ({e['type']})", r.status_code == 201)

# --- Investigate ---
r = httpx.post(f"{BASE}/api/cases/{cid}/investigate", timeout=T)
check("investigate", r.status_code == 200, r.text[:150] if r.status_code != 200 else "")
if r.status_code != 200:
    print(r.text)
    raise SystemExit(1)
a = r.json()
check("version 1", a["version_number"] == 1)
check("has facts", len(a["facts"]) >= 1)
check("has timeline", len(a["timeline_events"]) >= 1)
check("found contradiction", len(a["contradictions"]) >= 1)
check("has hypotheses", len(a["hypotheses"]) >= 1)
check("has unknowns", len(a["unknowns"]) >= 1)

# --- Analysis endpoint ---
r = httpx.get(f"{BASE}/api/cases/{cid}/analysis", timeout=T)
check("analysis endpoint", r.status_code == 200)
check("analysis has facts", len(r.json()["facts"]) >= 1)

# --- Versions endpoint ---
r = httpx.get(f"{BASE}/api/cases/{cid}/versions", timeout=T)
check("versions endpoint", r.status_code == 200)
check("one version", len(r.json()) == 1)

# --- Chat ---
r = httpx.post(f"{BASE}/api/cases/{cid}/chat", json={"message": "Why is John suspicious?"}, timeout=T)
check("chat", r.status_code == 200)
ans = r.json()["answer"]
check("chat has answer", len(ans) > 20)
print(f"\nQ: Why is John suspicious?\nA: {ans[:200]}...")

# --- Chat history ---
r = httpx.get(f"{BASE}/api/cases/{cid}/chat", timeout=T)
check("chat history", r.status_code == 200 and len(r.json()) == 2)

# --- Re-investigate (versioning) ---
r = httpx.post(f"{BASE}/api/cases/{cid}/investigate", timeout=T)
check("re-investigate", r.status_code == 200)
check("version 2", r.json()["version_number"] == 2)

# --- Diff ---
r = httpx.get(f"{BASE}/api/cases/{cid}/versions/diff?from_v=1&to_v=2", timeout=T)
check("diff endpoint", r.status_code == 200)
check("diff has facts", "facts" in r.json())

# --- Case list ---
r = httpx.get(f"{BASE}/api/cases", timeout=T)
check("case list", r.status_code == 200 and len(r.json()) >= 1)

print("\n=== ALL E2E TESTS PASSED ===")
