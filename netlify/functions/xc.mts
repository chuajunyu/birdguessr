const XC_API = "https://xeno-canto.org/api/3/recordings";

export default async (request: Request) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "missing query param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.XC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const xcQuery = query.replace(/ /g, "+").replace(/"/g, "%22");
  const target = `${XC_API}?query=${xcQuery}&key=${encodeURIComponent(apiKey)}&per_page=50`;

  const res = await fetch(target);
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
