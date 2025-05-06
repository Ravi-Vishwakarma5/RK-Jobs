import Image from "next/image";
import Link from "next/link";
import JobCard from "@/components/ui/JobCard";
import { jobPosts } from "@/data/jobPosts";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Job Portal Logo"
              width={120}
              height={30}
              priority
            />
            <nav className="ml-10 space-x-8 hidden md:flex">
              <Link href="/home" className="text-blue-600 font-medium">Home</Link>
              <Link href="/jobs" className="text-gray-500 hover:text-gray-900">Browse Jobs</Link>
              <Link href="/companies" className="text-gray-500 hover:text-gray-900">Companies</Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">About</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/user"
              className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Job Today</h1>
            <p className="text-xl mb-8">Browse thousands of job listings and find the perfect match for your skills and experience.</p>

            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <Button variant="primary" size="lg">
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Job Postings</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-medium">
              View all jobs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPosts.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse Jobs by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Technology', 'Design', 'Marketing', 'Sales', 'Customer Service', 'Finance', 'Healthcare', 'Education'].map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="font-medium text-lg mb-2">{category}</h3>
                <p className="text-gray-500 text-sm">{Math.floor(Math.random() * 100) + 20} jobs available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Portal</h3>
              <p className="text-gray-400">Find your dream job or hire the perfect candidate with our comprehensive job portal.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Browse Jobs</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Create Resume</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Job Alerts</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Career Advice</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Post a Job</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Browse Resumes</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Recruiting Solutions</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Pricing Plans</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@jobportal.com</li>
                <li className="text-gray-400">Phone: (123) 456-7890</li>
                <li className="text-gray-400">Address: 123 Main St, City, Country</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
