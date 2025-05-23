import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import CompanyModel from '@/app/uitlis/model/company';
import JobModel from '@/app/uitlis/model/job';
import { verifyToken } from '@/app/uitlis/jwt';

// Job templates for different industries
const jobTemplates: Record<string, any[]> = {
  'Technology': [
    {
      titlePrefix: 'Senior',
      titleSuffix: 'Developer',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 80,
      salaryMax: 150,
      description: [
        'We are looking for an experienced developer to join our team.',
        'You will be responsible for designing, developing, and maintaining our software applications.',
        'This is a great opportunity to work with cutting-edge technologies and contribute to innovative projects.'
      ],
      requirements: [
        '5+ years of experience in software development',
        'Strong problem-solving skills',
        'Experience with agile development methodologies',
        'Excellent communication skills'
      ],
      responsibilities: [
        'Design and develop high-quality software solutions',
        'Collaborate with cross-functional teams',
        'Participate in code reviews and ensure code quality',
        'Troubleshoot and debug applications'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Flexible working hours',
        'Remote work options',
        'Professional development opportunities'
      ]
    },
    {
      titlePrefix: 'Product',
      titleSuffix: 'Manager',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 90,
      salaryMax: 160,
      description: [
        'We are seeking a talented Product Manager to help us build amazing products.',
        'You will be responsible for the product vision, strategy, and roadmap.',
        'This role requires a blend of business acumen, technical knowledge, and user empathy.'
      ],
      requirements: [
        '3+ years of experience in product management',
        'Strong analytical and problem-solving skills',
        'Experience with product lifecycle management',
        'Excellent communication and leadership skills'
      ],
      responsibilities: [
        'Define product vision, strategy, and roadmap',
        'Gather and prioritize product requirements',
        'Work closely with engineering, design, and marketing teams',
        'Analyze market trends and competition'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Flexible working hours',
        'Remote work options',
        'Professional development budget'
      ]
    }
  ],
  'Finance': [
    {
      titlePrefix: 'Senior',
      titleSuffix: 'Accountant',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 70,
      salaryMax: 110,
      description: [
        'We are looking for a Senior Accountant to join our finance team.',
        'You will be responsible for managing accounting operations and financial reporting.',
        'This role is critical for maintaining the financial health of our organization.'
      ],
      requirements: [
        'CPA certification',
        '5+ years of accounting experience',
        'Proficiency in accounting software',
        'Strong attention to detail'
      ],
      responsibilities: [
        'Manage accounting operations',
        'Prepare financial statements and reports',
        'Ensure compliance with accounting standards',
        'Assist with budgeting and forecasting'
      ],
      benefits: [
        'Competitive salary',
        'Health and retirement benefits',
        'Professional development opportunities',
        'Paid time off',
        'Flexible work arrangements'
      ]
    },
    {
      titlePrefix: 'Financial',
      titleSuffix: 'Analyst',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 65,
      salaryMax: 100,
      description: [
        'We are seeking a Financial Analyst to support our financial planning and analysis.',
        'You will be responsible for financial modeling, forecasting, and reporting.',
        'This role is essential for driving data-driven financial decisions.'
      ],
      requirements: [
        'Bachelor\'s degree in Finance, Accounting, or related field',
        '3+ years of experience in financial analysis',
        'Proficiency in Excel and financial modeling',
        'Strong analytical skills'
      ],
      responsibilities: [
        'Develop financial models and forecasts',
        'Analyze financial data and trends',
        'Prepare financial reports and presentations',
        'Support budgeting and planning processes'
      ],
      benefits: [
        'Competitive salary',
        'Health and retirement benefits',
        'Professional development opportunities',
        'Paid time off',
        'Flexible work arrangements'
      ]
    }
  ],
  'Healthcare': [
    {
      titlePrefix: 'Registered',
      titleSuffix: 'Nurse',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: '/hour',
      salaryMin: 30,
      salaryMax: 50,
      description: [
        'We are looking for a compassionate Registered Nurse to join our healthcare team.',
        'You will be responsible for providing high-quality patient care.',
        'This role requires clinical expertise and a patient-centered approach.'
      ],
      requirements: [
        'RN license',
        '2+ years of nursing experience',
        'BLS/ACLS certification',
        'Strong communication skills'
      ],
      responsibilities: [
        'Provide direct patient care',
        'Administer medications and treatments',
        'Document patient information',
        'Collaborate with healthcare team'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Retirement plan',
        'Continuing education support',
        'Flexible scheduling'
      ]
    },
    {
      titlePrefix: 'Medical',
      titleSuffix: 'Assistant',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: '/hour',
      salaryMin: 18,
      salaryMax: 28,
      description: [
        'We are seeking a Medical Assistant to support our clinical operations.',
        'You will be responsible for both administrative and clinical tasks.',
        'This role is essential for ensuring smooth patient flow and quality care.'
      ],
      requirements: [
        'Medical Assistant certification',
        '1+ years of experience in a healthcare setting',
        'Knowledge of medical terminology',
        'Strong organizational skills'
      ],
      responsibilities: [
        'Assist with patient examinations',
        'Perform basic clinical procedures',
        'Schedule appointments',
        'Maintain patient records'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Retirement plan',
        'Paid time off',
        'Professional development opportunities'
      ]
    }
  ],
  'default': [
    {
      titlePrefix: 'Senior',
      titleSuffix: 'Specialist',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 60,
      salaryMax: 100,
      description: [
        'We are looking for a Senior Specialist to join our team.',
        'You will be responsible for managing key projects and initiatives.',
        'This role offers great opportunities for professional growth and development.'
      ],
      requirements: [
        '5+ years of relevant experience',
        'Bachelor\'s degree in a related field',
        'Strong analytical and problem-solving skills',
        'Excellent communication skills'
      ],
      responsibilities: [
        'Manage projects and initiatives',
        'Collaborate with cross-functional teams',
        'Develop and implement strategies',
        'Analyze data and provide insights'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Retirement plan',
        'Paid time off',
        'Professional development opportunities'
      ]
    },
    {
      titlePrefix: 'Junior',
      titleSuffix: 'Associate',
      jobType: 'Full-time',
      salaryPrefix: '$',
      salarySuffix: 'k/year',
      salaryMin: 40,
      salaryMax: 70,
      description: [
        'We are seeking a Junior Associate to support our team.',
        'You will be responsible for assisting with various projects and tasks.',
        'This role is perfect for someone looking to start their career in our industry.'
      ],
      requirements: [
        'Bachelor\'s degree in a related field',
        '1-2 years of relevant experience',
        'Strong organizational skills',
        'Ability to work in a team environment'
      ],
      responsibilities: [
        'Support team projects and initiatives',
        'Assist with data collection and analysis',
        'Prepare reports and presentations',
        'Coordinate with team members'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Retirement plan',
        'Paid time off',
        'Professional development opportunities'
      ]
    }
  ]
};

// Function to generate a random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random salary
function generateSalary(template: any): string {
  const min = template.salaryMin;
  const max = template.salaryMax;
  
  if (template.salarySuffix === '/hour') {
    return `${template.salaryPrefix}${getRandomNumber(min, max)}${template.salarySuffix}`;
  } else {
    return `${template.salaryPrefix}${getRandomNumber(min, max)}-${getRandomNumber(max, max + 20)}${template.salarySuffix}`;
  }
}

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/admin/generate-jobs');

  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded || !decoded.isAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized access'
        }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    // Connect to MongoDB
    await connectDB();

    // Get all companies
    const companies = await CompanyModel.find().lean();

    if (!companies || companies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No companies found'
      }, { status: 404 });
    }

    console.log(`Found ${companies.length} companies`);

    // Create jobs for each company
    const createdJobs = [];
    const errors = [];

    for (const company of companies) {
      try {
        // Get job templates based on industry or use default
        const industryTemplates = jobTemplates[company.industry] || jobTemplates['default'];
        
        // Create two jobs for each company
        for (let i = 0; i < 2; i++) {
          const template = industryTemplates[i];
          
          // Generate job title
          const title = `${template.titlePrefix} ${template.titleSuffix}`;
          
          // Generate salary
          const salary = generateSalary(template);
          
          // Create new job
          const newJob = new JobModel({
            title,
            company: company.name,
            location: company.location,
            jobType: template.jobType,
            category: company.industry,
            salary,
            logo: company.logo || '',
            description: template.description,
            requirements: template.requirements,
            responsibilities: template.responsibilities,
            benefits: template.benefits
          });
          
          // Save job to database
          await newJob.save();
          
          createdJobs.push({
            id: newJob._id.toString(),
            title: newJob.title,
            company: newJob.company
          });
        }
      } catch (error: any) {
        console.error(`Error creating jobs for company ${company.name}:`, error);
        errors.push({
          company: company.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdJobs.length} jobs for ${companies.length} companies`,
      jobs: createdJobs,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error generating jobs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate jobs',
      details: error.message
    }, { status: 500 });
  }
}
