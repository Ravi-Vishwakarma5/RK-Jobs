import React from 'react';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <div>
      <Header title="Profile" />
      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-medium">
                  JD
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-900">John Doe</h2>
                  <p className="text-gray-500">Frontend Developer</p>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </Card>

          <Card className="mb-6" title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-gray-900">John Doe</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">john.doe@example.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">+1 (555) 123-4567</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-gray-900">New York, NY</p>
              </div>
            </div>
          </Card>

          <Card className="mb-6" title="Professional Summary">
            <p className="text-gray-700">
              Experienced Frontend Developer with 5+ years of experience building responsive and
              user-friendly web applications. Proficient in React, TypeScript, and modern CSS
              frameworks. Passionate about creating intuitive user interfaces and optimizing web
              performance.
            </p>
          </Card>

          <Card className="mb-6" title="Skills">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">JavaScript</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">HTML5</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">CSS3</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Tailwind CSS</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Redux</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Next.js</span>
            </div>
          </Card>

          <Card className="mb-6" title="Experience">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Senior Frontend Developer</h3>
                  <span className="text-sm text-gray-500">2022 - Present</span>
                </div>
                <p className="text-gray-700">Tech Solutions Inc.</p>
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  <li>Led the frontend development of the company&apos;s flagship product</li>
                  <li>Implemented responsive design principles to improve mobile user experience</li>
                  <li>Collaborated with UX designers to create intuitive user interfaces</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Frontend Developer</h3>
                  <span className="text-sm text-gray-500">2019 - 2022</span>
                </div>
                <p className="text-gray-700">Web Innovations</p>
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  <li>Developed and maintained multiple client websites</li>
                  <li>Optimized web performance and loading times</li>
                  <li>Implemented analytics tracking and A/B testing</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card title="Education">
            <div>
              <div className="flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Bachelor of Science in Computer Science</h3>
                <span className="text-sm text-gray-500">2015 - 2019</span>
              </div>
              <p className="text-gray-700">University of Technology</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
