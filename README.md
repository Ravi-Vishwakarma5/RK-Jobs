# Job Portal

A comprehensive job portal application built with Next.js, React, and MongoDB.

## Features

- **Job Listings**: Browse and search for job opportunities
- **Job Applications**: Apply for jobs with a simple application form
- **Subscription System**: Premium subscription for job seekers
- **User Authentication**: Login with subscription email and JWT tokens
- **Saved Jobs**: Save and manage job listings
- **Admin Panel**: Manage jobs, applications, and subscriptions
- **Responsive Design**: Works on desktop and mobile devices

## Recent Updates

- Added JWT token authentication with 1-hour expiration
- Implemented saved jobs functionality
- Added subscription verification system
- Added payment processing with database storage
- Created user dashboard for subscribers

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Payment Processing**: Razorpay
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Ravi-Vishwakarma5/RK-Jobs.git
   ```

2. Install dependencies:
   ```
   cd job-portal
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=Your_mongodb_uri
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Browse Jobs**: View all available job listings on the home page
2. **Subscribe**: Choose a subscription plan (Basic, Professional, or Premium)
3. **Login**: Use your subscription email to log in
4. **Save Jobs**: Save interesting job listings for later
5. **Apply for Jobs**: Submit applications for jobs you're interested in
6. **Manage Applications**: Track your job applications in the user dashboard

## Deployment

The application can be deployed to Vercel or any other hosting platform that supports Next.js.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Razorpay](https://razorpay.com/)
