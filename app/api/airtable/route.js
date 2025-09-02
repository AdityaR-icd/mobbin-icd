// app/api/airtable/route.js
export async function GET() {
  try {
    // Debug logs
    console.log("DEBUG → AIRTABLE_URL:", process.env.AIRTABLE_URL);
    console.log(
      "DEBUG → AIRTABLE_TOKEN (first 6 chars):",
      process.env.AIRTABLE_TOKEN?.slice(0, 6)
    );

    const r = await fetch(process.env.AIRTABLE_URL, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("DEBUG → Airtable response error:", text);
      return new Response(JSON.stringify({ error: text }), {
        status: r.status,
      });
    }

    const data = await r.json();
    console.log("DEBUG → Airtable data sample:", data.records?.[0]);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error("DEBUG → Server error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
