import { redirect } from 'next/navigation';

// The landing page is the root URL now. This route stays only so links minted
// while it lived at /landing keep working.
export default function LandingRedirect() {
  redirect('/');
}
