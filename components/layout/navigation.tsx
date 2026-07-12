import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  return (
    <nav className="border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Study Partner Agent
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/upload">
              <Button variant="ghost">Upload</Button>
            </Link>
            <Link href="/quiz">
              <Button variant="ghost">Quiz</Button>
            </Link>
            <Link href="/study">
              <Button variant="ghost">Study Plan</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}