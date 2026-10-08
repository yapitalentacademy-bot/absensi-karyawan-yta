import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export default function HomePage() {
  const session = getCurrentSession();
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
