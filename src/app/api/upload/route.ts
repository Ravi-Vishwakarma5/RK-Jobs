import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary directly (NOT RECOMMENDED FOR PRODUCTION)
cloudinary.config({
  cloud_name: 'dkzupc7jr',
  api_key: '485433287949582',
  api_secret: 'UE7vHfJ5-_0nd8FQZdNkOvAYMnY',
  secure: true,
});

// Check if Cloudinary is properly configured
function isCloudinaryConfigured() {
  return (
    'dkzupc7jr' !== 'demo' &&
    '485433287949582'.length > 0 &&
    'UE7vHfJ5-_0nd8FQZdNkOvAYMnY'.length > 0
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: 'Image upload is not available. Cloudinary credentials are not configured.',
        },
        { status: 503 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    try {
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'job-portal/companies',
        resource_type: 'auto',
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (uploadError: any) {
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process upload', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { public_id } = body;

    if (!public_id) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
    }

    try {
      const result = await cloudinary.uploader.destroy(public_id);
      if (result.result === 'ok') {
        return NextResponse.json({ success: true, message: 'Image deleted successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to delete image', details: result }, { status: 500 });
      }
    } catch (deleteError: any) {
      return NextResponse.json(
        { error: 'Failed to delete image', details: deleteError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process delete', details: error.message },
      { status: 500 }
    );
  }
}
