// Mini-serveur : la clé TMDB reste ici, jamais dans la page publique.
const BASE = "https://api.themoviedb.org/3";
const ALLOWED = ["with_genres","without_genres","with_watch_providers","with_runtime.lte",
  "primary_release_date.gte","primary_release_date.lte","first_air_date.gte","first_air_date.lte",
  "sort_by","vote_count.gte","page"];

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  let target;

  if (action === "providers") {
    target = new URL(BASE + "/watch/providers/movie");
  } else if (action === "discover") {
    const type = url.searchParams.get("type") === "tv" ? "tv" : "movie";
    target = new URL(BASE + "/discover/" + type);
    for (const k of ALLOWED) {
      const v = url.searchParams.get(k);
      if (v) target.searchParams.set(k, v);
    }
    target.searchParams.set("with_watch_monetization_types", "flatrate");
    target.searchParams.set("include_adult", "false");
  } else {
    return new Response("Bad request", { status: 400 });
  }

  target.searchParams.set("watch_region", "FR");
  target.searchParams.set("language", "fr-FR");

  const headers = { accept: "application/json" };
  const key = env.TMDB_KEY || "";
  if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key; // jeton "Read Access"
  else target.searchParams.set("api_key", key);                       // clé API classique

  const res = await fetch(target.toString(), { headers });
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" }
  });
}
