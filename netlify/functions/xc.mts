const XC_API = "https://xeno-canto.org/api/3/recordings";

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return Response.json({ error: "missing query param" }, { status: 400 });
    }

    const apiKey = process.env.XC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "XC_API_KEY env var not set" }, { status: 500 });
    }

    const xcQuery = query.replace(/ /g, "+").replace(/"/g, "%22");
    const target = `${XC_API}?query=${xcQuery}&key=${encodeURIComponent(apiKey)}&per_page=50`;

    const res = await fetch(target);
    const body = await res.text();

    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json(
      { error: "function error", detail: String(err) },
      { status: 500 },
    );
  }
};
