import Landing from './component/Landing';

/**
 * The root URL is the landing page and nothing else.
 *
 * It used to serve double duty — marketing for signed-out visitors, the
 * workspace for signed-in ones — which meant it could not know what to render
 * until JavaScript had booted and the session probe had answered. Whichever it
 * guessed, half the visitors watched the page swap under them. The workspace now
 * lives at /dashboard, so each URL renders exactly one thing and nothing shifts.
 *
 * Keeping this a server component also means the marketing copy is in the HTML
 * for crawlers, rather than appearing only after a round trip to the API.
 */
export default function Home() {
  return <Landing />;
}
